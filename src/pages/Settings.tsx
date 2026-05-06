import React from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Save } from 'lucide-react';

export default function Settings() {
    return (
        <div className="space-y-10 pb-12">
            <header className="flex justify-between items-baseline border-b-2 border-[#1A1A1A] pb-6">
                <div className="flex flex-col">
                    <h1 className="text-5xl lg:text-7xl font-serif font-black tracking-tighter uppercase leading-none">Settings</h1>
                    <p className="text-xs font-bold tracking-[0.3em] uppercase mt-4 opacity-60">Manage your account and marking preferences.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="border-2 border-[#1A1A1A] bg-white">
                        <div className="p-6 border-b-2 border-[#1A1A1A]">
                            <h3 className="font-serif font-black text-xl italic tracking-tighter">Profile Information</h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">Full Name</label>
                                <Input defaultValue="Mr. Olatoke" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">Email Address</label>
                                <Input defaultValue="olatokeoluwole@gmail.com" type="email" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">School Name</label>
                                <Input defaultValue="International School Lagos" />
                            </div>
                            <div className="pt-4 border-t-2 border-[#1A1A1A]">
                                <Button>
                                    <Save className="w-4 h-4 mr-2" /> Save Profile
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="border-2 border-[#1A1A1A] bg-white">
                        <div className="p-6 border-b-2 border-[#1A1A1A]">
                            <h3 className="font-serif font-black text-xl italic tracking-tighter">Grading Preferences</h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="space-y-2 relative">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">Marking Strictness</label>
                                <select className="flex h-12 w-full border-2 border-[#1A1A1A] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]">
                                    <option>Strict (WAEC Standard)</option>
                                    <option>Moderate</option>
                                    <option>Lenient</option>
                                </select>
                            </div>
                            <div className="flex items-center space-x-3">
                                <input type="checkbox" id="show-partial" className="w-5 h-5 border-2 border-[#1A1A1A] rounded-none checked:bg-[#1A1A1A]" defaultChecked />
                                <label htmlFor="show-partial" className="text-sm font-bold uppercase tracking-widest text-[#1A1A1A]">Award partial marks for steps</label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-[#1A1A1A] text-white p-6 h-full flex flex-col border-2 border-[#1A1A1A]">
                        <div className="border-b border-white/20 pb-4 mb-6">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-60">System Information</h3>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <p className="font-bold text-xs uppercase tracking-widest">Version</p>
                                <p className="text-[10px] opacity-70 mt-2 leading-relaxed">WAEC Assistant v1.2.0-beta</p>
                            </div>
                            <div>
                                <p className="font-bold text-xs uppercase tracking-widest">AI Model</p>
                                <p className="text-[10px] opacity-70 mt-2 leading-relaxed">Gemini Pro Vision (RAG tuned)</p>
                            </div>
                             <div>
                                <p className="font-bold text-xs uppercase tracking-widest">API Status</p>
                                <p className="text-[10px] text-emerald-400 mt-2 leading-relaxed font-bold">Online & Connected</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
