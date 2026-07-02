"use client";

import React from "react";
import { ChevronDown, LogOut, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

import { Button } from "./ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "./ui/popover";

const Header = () => {
    const { data: session } = useSession();

    return (
        <header className="block w-full border-b border-gray-100 bg-white/80 backdrop-blur-md max-w-screen-2xl p-2 mx-auto">
            <div className="mx-auto px-4 flex items-center justify-between">
                <div className="flex items-center space-x-6">
                    <span className="font-semibold text-lg md:text-2xl text-gray-900 tracking-tight">
                        Ticktock
                    </span>
                    <span className="inline-block font-medium text-sm text-gray-900 tracking-tight">
                        Timesheets
                    </span>
                </div>

                <Popover>
                    <PopoverTrigger className="h-auto px-2 py-1.5 flex items-center gap-2 hover:bg-transparent cursor-pointer">


                        <div className="flex md:hidden">
                            <div className="h-6 w-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center font-semibold text-blue-700">
                                {session?.user?.name ? (
                                    session.user.name.charAt(0).toUpperCase()
                                ) : (
                                    <User className="h-4 w-4" />
                                )}
                            </div>
                        </div>
                        <div className="hidden sm:flex flex-col items-start leading-tight">
                            <span className="text-sm font-medium text-gray-700">
                                {session?.user?.name || "Loading..."}
                            </span>
                        </div>
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                    </PopoverTrigger>

                    <PopoverContent align="end" className="w-72 p-2">
                        <div className="px-2 py-2">
                            <p className="font-medium text-sm text-gray-900">
                                {session?.user?.name}
                            </p>
                            <p className="text-xs text-muted-foreground break-all">
                                {session?.user?.email}
                            </p>
                        </div>

                        <div className="my-0 border-t" />

                        <Button
                            variant="ghost"
                            className="cursor-pointer w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
                            onClick={() => signOut({ callbackUrl: "/login" })}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                        </Button>
                    </PopoverContent>
                </Popover>
            </div>
        </header>
    );
};

export default Header;