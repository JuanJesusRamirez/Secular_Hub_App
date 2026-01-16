
"use client";

import { useState } from "react";
import { SP500Chart } from "@/components/charts/sp500-chart";
import { XAUChart } from "@/components/charts/xau-chart";
import { FEDRateChart } from "@/components/charts/fed-rate-chart";

type Asset = 'sp500' | 'xau' | 'fed-rate';

export default function AssetsDashboard() {
    const [selectedAsset, setSelectedAsset] = useState<Asset>('sp500');

    return (
        <div className="h-full w-full overflow-y-auto bg-white min-h-[500px]">
            {/* Navigation Tabs */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex gap-2">
                    <button
                        onClick={() => setSelectedAsset('sp500')}
                        className={`px-6 py-2 rounded-lg font-semibold transition-all ${selectedAsset === 'sp500'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        S&P 500
                    </button>
                    <button
                        onClick={() => setSelectedAsset('xau')}
                        className={`px-6 py-2 rounded-lg font-semibold transition-all ${selectedAsset === 'xau'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        XAU
                    </button>
                    <button
                        onClick={() => setSelectedAsset('fed-rate')}
                        className={`px-6 py-2 rounded-lg font-semibold transition-all ${selectedAsset === 'fed-rate'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        FED Rate
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="w-full">
                {selectedAsset === 'sp500' && <SP500Chart />}
                {selectedAsset === 'xau' && <XAUChart />}
                {selectedAsset === 'fed-rate' && <FEDRateChart />}
            </div>
        </div>
    );
}
