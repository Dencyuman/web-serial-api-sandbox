"use client";

import {useEffect, useState} from "react";
import detectBrowser from "@/modules/detectBrowser";
import {Button} from "@/components/ui/button";
import {Alert, AlertTitle, AlertDescription} from "@/components/ui/alert";
import {Badge} from "@/components/ui/badge";
import {serialConnectionHealthCheck, readEPCFromRFIDReader, sendInventoryCommand} from "@/modules/webSerialAPI";
import LoadingOverlay from "@/components/LoadingOverlay";

export default function Home() {
    const [browser, setBrowser] = useState<ReturnType<typeof detectBrowser> | undefined>(undefined);
    const [isConnected, setIsConnected] = useState<boolean | undefined>(undefined);
    const [isReaded, setIsReaded] = useState<boolean>(false);
    const [readedEpc, setReadedEpc] = useState<string[] | null>(null);
    const [isReading, setIsReading] = useState<boolean>(false);

    useEffect(() => {
        setBrowser(detectBrowser(window.navigator.userAgent));
    }, []);


    const handleCheckConnection = async () => {
        const isSerialConnected = await serialConnectionHealthCheck();
        if (isSerialConnected) {
            setIsConnected(true);
        } else {
            setIsConnected(false);
        }
    }

    const handleReadEPC = async () => {
        setIsReading(true);
        // const result = await readEPCFromRFIDReader();
        const result = await sendInventoryCommand();
        setIsReaded(true)
        setReadedEpc(result.epcs)
        setIsReading(false);
    }

    return (
        <main className="flex min-h-screen flex-col items-start justify-start p-24 gap-4">
            {isReading && <LoadingOverlay />}
            <h1 className="text-2xl font-bold">Web Serial API Sandbox</h1>
            <div className="flex gap-4">
                <p>You using <span className="font-semibold">{browser}</span>!</p>
                {browser === "UnknownBrowser" ? (
                    <Badge variant="destructive">Unsupported</Badge>
                ) : (
                    <Badge variant="info">Supported</Badge>
                )}
            </div>
            {browser === "UnknownBrowser" && (
                <>
                    <Alert variant="destructive" className="w-[500px]">
                        <AlertTitle className="text-xl font-bold">Unsupported browser</AlertTitle>
                        <AlertDescription>Please retry with "Google Chrome" or "Microsoft Edge" or "Opera".</AlertDescription>
                    </Alert>
                </>
            )}
            {
                browser !== "UnknownBrowser" && (
                    <Button variant="default" size="sm" onClick={handleReadEPC}>Read EPC</Button>
                )
            }
            {
                isReaded && (
                    readedEpc ? (
                        <Alert variant="info" className="w-[400px]">
                            <AlertTitle className="text-xl font-bold">Found EPC</AlertTitle>
                            <AlertDescription>{
                                readedEpc.map((epc, index) => (
                                    <p key={index}>{epc.toUpperCase()}</p>
                                ))
                                // Array.from(readedEpc).map((epc, index) => (
                                //     <p key={index}>{epc}</p>
                                // ))
                            }</AlertDescription>
                        </Alert>
                    ) : (
                        <Alert variant="destructive" className="w-[400px]">
                            <AlertTitle className="text-xl font-bold">Tags Not Found</AlertTitle>
                            <AlertDescription>Failed to read EPC from RFID Reader.</AlertDescription>
                        </Alert>
                    )
                )
            }




        </main>
    );
}
