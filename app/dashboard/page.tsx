import { createClient } from '@supabase/supabase-js';

// Inisialisasi Supabase (sama seperti di API Route)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export default async function DashboardPage() {
  // Mengambil 20 data terbaru dari tabel sensor_logs
  const { data: logs, error } = await supabase
    .from('sensor_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) return <p>Gagal mengambil data: {error.message}</p>;

  return (
    <div className="p-8 font-sans">
      <h1 className="text-2xl font-bold mb-6">Monitoring Sensor ESP32-S3</h1>
      
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full bg-white text-black">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left">Waktu</th>
              <th className="px-6 py-3 text-left">Tipe Sensor</th>
              <th className="px-6 py-3 text-left">Nilai (Value)</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {logs?.map((log) => (
              <tr key={log.id}>
                <td className="px-6 py-4">
                  {new Date(log.created_at).toLocaleString('id-ID')}
                </td>
                <td className="px-6 py-4 font-medium">{log.sensor_type}</td>
                <td className="px-6 py-4 text-blue-600 font-bold">
                  {log.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}