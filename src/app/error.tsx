"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <main className="flex min-h-screen items-center justify-center px-4">
            <div className="w-full max-w-md space-y-6 text-center">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">
                        Something went wrong
                    </h1>

                    <p className="text-muted-foreground">
                        We couldn&apos;t load this page. Please try again.
                    </p>
                </div>

                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                    <Button onClick={reset}>
                        Try again
                    </Button>

                    <Button
                        variant="outline"
                        nativeButton={false}
                        render={<Link href="/" />}
                    >
                        Go home
                    </Button>
                </div>
            </div>
        </main>
    );
}