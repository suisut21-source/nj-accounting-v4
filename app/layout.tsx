import './globals.css';
import Sidebar from './components/Sidebar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>
        <div className="flex flex-col md:flex-row min-h-screen bg-[#F8FAFC] font-sans text-slate-800 overflow-x-hidden">
          {/* Sidebar สำหรับมือถือและคอมพิวเตอร์ */}
          <Sidebar />
          
          {/* ส่วนเนื้อหาหลักด้านขวา */}
          <main className="flex-1 p-4 md:p-6 overflow-y-auto w-full">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}