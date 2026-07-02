import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import React from 'react';


const BackHeader = () => {
    return (
        <div className="rounded-xl p-3 w-full border-b border-gray-100 card-shadow bg-white">
            <div className="flex items-center justify-between">

                <Link href={'/timesheets'} className='flex items-center space-x-4'>
                    <ArrowLeft className="h-5 w-5 text-brand-primary" />
                    <span className="font-medium text-base text-gray-900 tracking-tight">
                        Back to timesheets
                    </span>
                </Link>

            </div>
        </div>
    )
}

export default BackHeader