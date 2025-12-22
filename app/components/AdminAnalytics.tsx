"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Users, TrendingUp, Download, ChevronDown, Check } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Slot, UserType } from "../types";
import { getTodayDate, isPastSlot } from "../utils/helpers";

export const AdminAnalytics = ({ slots = [], users = [], currentLogo }: { slots: Slot[], users: UserType[], currentLogo: string }) => {
    const [isMounted, setIsMounted] = React.useState(false);
    const [dateFilter, setDateFilter] = React.useState<'All' | 'Today' | 'Week' | 'Month' | 'Custom'>('All');
    const [isDateFilterOpen, setIsDateFilterOpen] = React.useState(false);
    const [customStartDate, setCustomStartDate] = React.useState('');
    const [customEndDate, setCustomEndDate] = React.useState('');
    const [showCustomDateModal, setShowCustomDateModal] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    // ... (rest of state)

    const [reportFilter, setReportFilter] = React.useState<'All' | 'Active' | 'Completed'>('All');
    const [isFilterOpen, setIsFilterOpen] = React.useState(false);



    const filterOptions = [
        { value: 'All', label: 'All Statuses' },
        { value: 'Active', label: 'Active Only' },
        { value: 'Completed', label: 'Completed Only' }
    ];

    // 1. Tarih Filtreleme Logic (Düzeltildi & Robust)
    // Helper: Normalize date to YYYY-MM-DD checks
    const normalizeDate = (dateVal: string | number | Date): string => {
        if (!dateVal) return '';
        const str = String(dateVal).trim();
        // Handle DD.MM.YYYY
        if (str.includes('.')) {
            const [d, m, y] = str.split('.');
            if (d && m && y && d.length <= 2 && m.length <= 2 && y.length === 4) return `${y}-${m}-${d}`;
        }
        // Handle DD/MM/YYYY
        if (str.includes('/')) {
            const [d, m, y] = str.split('/');
            if (d && m && y && d.length <= 2 && m.length <= 2 && y.length === 4) return `${y}-${m}-${d}`;
        }
        // Return original if likely YYYY-MM-DD or unknown
        return str;
    };

    // 0. Pre-normalize all slots for performance (Run once when slots change)
    const normalizedSlots = React.useMemo(() => {
        return slots.map(slot => ({
            ...slot,
            date: normalizeDate(slot.date) // Standardize to YYYY-MM-DD once
        }));
    }, [slots]); // methods inside are stable

    const dateFilteredSlots = React.useMemo(() => {
        const now = new Date();
        const todayStr = getTodayDate();

        return normalizedSlots.filter(slot => {
            if (!slot?.date) return false;
            const slotDate = slot.date; // Already normalized

            if (dateFilter === 'All') return true;
            if (dateFilter === 'Today') return slotDate === todayStr;

            if (dateFilter === 'Week') {
                const startOfWeek = new Date(now);
                // Haftanın başlangıcını (Pazartesi) bul
                const day = now.getDay();
                const diff = now.getDate() - day + (day === 0 ? -6 : 1);
                startOfWeek.setDate(diff);
                startOfWeek.setHours(0, 0, 0, 0);

                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                endOfWeek.setHours(23, 59, 59, 999);

                const sDate = new Date(slotDate);
                return sDate >= startOfWeek && sDate <= endOfWeek;
            }

            if (dateFilter === 'Month') {
                return slotDate.substring(0, 7) === todayStr.substring(0, 7);
            }

            if (dateFilter === 'Custom') {
                if (!customStartDate || !customEndDate) return true;
                return slotDate >= customStartDate && slotDate <= customEndDate;
            }
            return true;
        });
    }, [dateFilter, customStartDate, customEndDate, normalizedSlots]);

    // 2. Statü Filtreleme & İstatistikler
    const filteredSlots = React.useMemo(() => {
        return dateFilteredSlots.filter(slot => {
            const isActuallyPast = isPastSlot(slot.date, slot.time);
            const isActive = (slot.status === 'Booked' || slot.status === 'Active') && !isActuallyPast;
            const isCompleted = slot.status === 'Completed' || ((slot.status === 'Booked' || slot.status === 'Active') && isActuallyPast);

            if (reportFilter === 'Active') return isActive;
            if (reportFilter === 'Completed') return isCompleted;
            return isActive || isCompleted; // 'All' durumu
        });
    }, [dateFilteredSlots, reportFilter]);

    // Genel İstatistikler
    const totalBookings = filteredSlots.length;
    const totalSlots = dateFilteredSlots.length; // Doluluk oranı tüm slotlar üzerinden hesaplanmalı
    const occupancyRate = totalSlots > 0 ? Math.round((totalBookings / totalSlots) * 100) : 0;
    const totalUsers = users.length;

    // Aylık Dağılım Hesaplama (Düzeltildi)
    const filteredMonthlyStats = React.useMemo(() => {
        return filteredSlots.reduce((acc, slot) => {
            const monthKey = normalizeDate(slot.date).substring(0, 7);
            acc[monthKey] = (acc[monthKey] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }, [filteredSlots]);

    const tableMonths = Object.keys(filteredMonthlyStats).sort().reverse();

    const handleDownloadPDF = async () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        const brandColor = [206, 142, 148] as [number, number, number];

        const loadImage = (url: string): Promise<string> => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'Anonymous';
                img.src = url;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width; canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.beginPath();
                        ctx.arc(img.width / 2, img.height / 2, Math.min(img.width, img.height) / 2, 0, Math.PI * 2);
                        ctx.clip();
                        ctx.drawImage(img, 0, 0);
                        resolve(canvas.toDataURL('image/png'));
                    } else reject(new Error('Canvas context failed'));
                };
                img.onerror = (e) => reject(e);
            });
        };

        try {
            const logoToUse = currentLogo || '/logo.jpg';
            const logoBase64 = await loadImage(logoToUse);
            doc.addImage(logoBase64, 'PNG', 14, 10, 24, 24);
        } catch (e) {
            console.error("Logo error:", e);
            // Fallback retry with default logo if first attempt failed
            try {
                const defaultLogoBase64 = await loadImage('/logo.jpg');
                doc.addImage(defaultLogoBase64, 'PNG', 14, 10, 24, 24);
            } catch (err) {
                console.error("Default logo error:", err);
            }
        }

        doc.setFont("helvetica", "bold").setFontSize(22).setTextColor(...brandColor);
        doc.text("Reformer Pilates Malta", 42, 22);
        doc.setFontSize(11).setTextColor(100).setFont("helvetica", "normal");
        doc.text(`Report: ${dateFilter} | Status: ${reportFilter}`, 42, 29);

        // İstatistik Kutuları
        const statY = 45;
        const boxW = (pageWidth - 38) / 3;
        [
            { label: "Bookings", val: totalBookings },
            { label: "Members", val: totalUsers },
            { label: "Occupancy", val: `%${occupancyRate}` }
        ].forEach((item, i) => {
            const x = 14 + (i * (boxW + 5));
            doc.setFillColor(250, 250, 250).roundedRect(x, statY, boxW, 20, 2, 2, 'FD');
            doc.setFontSize(9).setTextColor(120).text(item.label, x + 5, statY + 7);
            doc.setFontSize(12).setTextColor(...brandColor).setFont("helvetica", "bold").text(String(item.val), x + 5, statY + 15);
        });

        // Aylık Tablo
        autoTable(doc, {
            startY: 75,
            head: [['Month', 'Sessions', 'Filter Context']],
            body: tableMonths.map(m => [
                new Date(m + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                `${filteredMonthlyStats[m]} sessions`,
                reportFilter
            ]),
            headStyles: { fillColor: brandColor },
            theme: 'grid'
        });

        // Detaylı Liste
        const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
        doc.setFontSize(14).setTextColor(60).text("Session Details", 14, finalY);

        autoTable(doc, {
            startY: finalY + 5,
            head: [['Date', 'Time', 'Client', 'Status']],
            body: filteredSlots.sort((a, b) => normalizeDate(a.date).localeCompare(normalizeDate(b.date))).map(s => {
                const isActuallyPast = isPastSlot(s.date, s.time);
                const displayStatus = ((s.status === 'Booked' || s.status === 'Active') && isActuallyPast) ? 'Completed' : s.status;
                return [s.date, s.time, s.bookedBy || '-', displayStatus];
            }),
            styles: { fontSize: 8 }
        });

        doc.save(`report-${getTodayDate()}.pdf`);
    };



    // Correct Placement: After all hooks, before JSX
    if (!isMounted) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading analytics...</div>;

    return (
        <div className="space-y-8 p-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <h3 className="text-2xl font-bold text-gray-800">Performance Overview</h3>
                <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                    {/* Tarih Filtresi */}
                    <div className="relative min-w-[160px] group">
                        <button
                            onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
                            className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 font-bold border border-gray-100 rounded-xl px-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#CE8E94]/20"
                        >
                            <span className="text-gray-800 truncate">{dateFilter}</span>
                            <Calendar className={`w-4 h-4 text-gray-400 transition-transform duration-300 group-hover:text-[#CE8E94] flex-shrink-0 ml-2 ${isDateFilterOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isDateFilterOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsDateFilterOpen(false)} />
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                                    {(['All', 'Today', 'Week', 'Month', 'Custom'] as const).map(opt => (
                                        <div key={opt} onClick={() => {
                                            if (opt === 'Custom') setShowCustomDateModal(true);
                                            else setDateFilter(opt);
                                            setIsDateFilterOpen(false);
                                        }} className={`px-4 py-3 cursor-pointer flex items-center justify-between transition-colors duration-200
                                            ${dateFilter === opt && opt !== 'Custom'
                                                ? 'bg-[#CE8E94]/10 text-[#CE8E94] font-bold'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                        >
                                            <span className="text-sm">{opt}</span>
                                            {dateFilter === opt && opt !== 'Custom' && <Check className="w-4 h-4 text-[#CE8E94]" />}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Statü Filtresi */}
                    <div className="relative min-w-[160px] group">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 font-bold border border-gray-100 rounded-xl px-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#CE8E94]/20"
                        >
                            <span className="text-gray-800 truncate">{reportFilter}</span>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 group-hover:text-[#CE8E94] flex-shrink-0 ml-2 ${isFilterOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isFilterOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                                    {filterOptions.map(opt => (
                                        <div key={opt.value} onClick={() => {
                                            setReportFilter(opt.value as 'All' | 'Active' | 'Completed');
                                            setIsFilterOpen(false);
                                        }} className={`px-4 py-3 cursor-pointer flex items-center justify-between transition-colors duration-200
                                            ${reportFilter === opt.value
                                                ? 'bg-[#CE8E94]/10 text-[#CE8E94] font-bold'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                        >
                                            <span className="text-sm">{opt.label}</span>
                                            {reportFilter === opt.value && <Check className="w-4 h-4 text-[#CE8E94]" />}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <Button onClick={handleDownloadPDF} className="bg-[#CE8E94] hover:bg-[#B57A80] text-white h-12 rounded-xl flex gap-2">
                        <Download className="w-5 h-5" /> Download PDF
                    </Button>
                </div>
            </div>

            {/* İstatistik Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Bookings" value={totalBookings} icon={<Calendar className="text-blue-500" />} bg="bg-blue-50" />
                <StatCard title="Total Members" value={totalUsers} icon={<Users className="text-purple-500" />} bg="bg-purple-50" />
                <StatCard title="Occupancy Rate" value={`%${occupancyRate}`} icon={<TrendingUp className="text-green-500" />} bg="bg-green-50" />
            </div>

            {/* Tablo */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b font-bold text-gray-800">Monthly Performance</div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                            <tr>
                                <th className="p-4">Month</th>
                                <th className="p-4">Sessions</th>
                                <th className="p-4">Status Filter</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {tableMonths.map(month => (
                                <tr key={month} className="hover:bg-gray-50">
                                    <td className="p-4 font-semibold">
                                        {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </td>
                                    <td className="p-4">{filteredMonthlyStats[month]} sessions</td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-[#CE8E94]/10 text-[#CE8E94] text-xs font-bold rounded-md">
                                            {reportFilter}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Custom Date Modal */}
            {showCustomDateModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl">
                        <h4 className="font-bold mb-4">Custom Date Range</h4>
                        <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} className="w-full mb-3 p-2 border rounded-lg" />
                        <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} className="w-full mb-4 p-2 border rounded-lg" />
                        <div className="flex gap-2">
                            <Button onClick={() => setShowCustomDateModal(false)} className="flex-1 bg-gray-100 text-gray-700">Cancel</Button>
                            <Button onClick={() => { setDateFilter('Custom'); setShowCustomDateModal(false); }} className="flex-1 bg-[#CE8E94] text-white">Apply</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ title, value, icon, bg }: { title: string, value: string | number, icon: React.ReactNode, bg: string }) => (
    <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start">
        <div>
            <p className="text-gray-500 text-sm">{title}</p>
            <h3 className="text-3xl font-bold mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${bg}`}>{icon}</div>
    </div>
);
