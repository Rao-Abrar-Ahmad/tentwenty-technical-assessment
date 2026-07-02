import React from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LoaderCircle } from 'lucide-react';

type props = {
    deleteOpen: boolean;
    setDeleteOpen: (open: boolean) => void;
    confirmDelete: () => void;
    loading: boolean;
}
const DeleteEntry = ({ deleteOpen, setDeleteOpen, confirmDelete, loading }: props) => {

    return (
        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogContent className="bg-white border-0 rounded-xl shadow-xl max-w-[400px]">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-gray-900 font-bold text-lg">
                        Are you sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-555 text-sm">
                        This action will permanently delete this task entry from your timesheet. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="space-x-2 px-3 py-2 bg-transparent border-none">
                    <AlertDialogCancel className="text-gray-500 hover:text-gray-900 border-gray-200 cursor-pointer">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={confirmDelete}
                        className="bg-red-600 hover:bg-red-70 text-white font-medium cursor-pointer"
                    >
                        Delete {loading && <LoaderCircle className='w-4 h-4 animate-spin' />}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default DeleteEntry