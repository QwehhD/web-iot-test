"use client";

import { useState } from "react";

interface Room {
  id: string;
  name: string;
  temperature: number;
  humidity: number;
  status: "active" | "inactive" | "warning";
  lastUpdated: string;
}

const mockRooms: Room[] = [
  {
    id: "enc-1",
    name: "Enklosur 1",
    temperature: 28.5,
    humidity: 65,
    status: "active",
    lastUpdated: "2 menit lalu",
  },
  {
    id: "enc-2",
    name: "Enklosur 2",
    temperature: 32.1,
    humidity: 72,
    status: "warning",
    lastUpdated: "1 menit lalu",
  },
  {
    id: "enc-3",
    name: "Ruang Kontrol",
    temperature: 25.3,
    humidity: 55,
    status: "active",
    lastUpdated: "3 menit lalu",
  },
];

export default function Home() {
  const [rooms, setRooms] = useState<Room[]>(mockRooms);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      case "inactive":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Aktif";
      case "warning":
        return "Peringatan";
      case "inactive":
        return "Tidak Aktif";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Smart Room Monitor
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Sistem monitoring ruangan dan enklosur real-time
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Total Ruangan
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {rooms.length}
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Status Aktif
                </p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {rooms.filter((r) => r.status === "active").length}
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                <span className="text-2xl">✓</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Peringatan
                </p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {rooms.filter((r) => r.status === "warning").length}
                </p>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg">
                <span className="text-2xl">⚠</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              {/* Room Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white p-4 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{room.name}</h2>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      room.status
                    )}`}
                  >
                    {getStatusLabel(room.status)}
                  </span>
                </div>
              </div>

              {/* Room Content */}
              <div className="p-6">
                {/* Sensor Data */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* Temperature */}
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🌡️</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Suhu
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {room.temperature}°C
                    </p>
                  </div>

                  {/* Humidity */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">💧</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Kelembaban
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {room.humidity}%
                    </p>
                  </div>
                </div>

                {/* Last Updated */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Update terakhir: {room.lastUpdated}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white py-2 rounded-lg transition-colors text-sm font-medium">
                    Detail
                  </button>
                  <button className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-2 rounded-lg transition-colors text-sm font-medium">
                    Kontrol
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
