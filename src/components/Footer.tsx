import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-white rounded-xl card-shadow p-8">
            <div className="flex items-center justify-center">
                <p className="text-sm text-gray-500">
                    © {new Date().getFullYear()} tentwenty. All rights reserved.
                </p>
            </div>
        </footer>
    )
}

export default Footer;