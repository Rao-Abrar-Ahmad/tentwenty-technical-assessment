import Footer from "@/components/Footer"
import Header from "@/components/Header"

export default function TimesheetLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <div className="min-h-screen bg-[#F8F8F8] block"><Header />
        <main className="flex-1 max-w-screen-xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {children}
            <Footer />
        </main>
    </div>
}