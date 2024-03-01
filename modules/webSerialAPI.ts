const serialConnectionHealthCheck = async () => {
    if ("serial" in navigator) {
        try {
            // @ts-ignore
            const port = await navigator.serial.requestPort();
            await port.open({baudRate: 9600});
            return true;
        } catch (error) {
            console.log("RFID Reader not found!", error);
            return false;
        }
    } else {
        console.log("Web Serial API not supported!");
        return false
    }
}

const waitSomeSecond = (waitSecond: number) => new Promise(resolve => setTimeout(resolve, waitSecond * 1000));

interface RFIDReadResult {
    epc: string[] | null;
    error: string | null;
}

const readEPCFromRFIDReader = async (readingSeconds: number): Promise<RFIDReadResult> => {
    console.log("Start to Read EPC from RFID Reader")
    if (!('serial' in navigator)) {
        console.log('Web Serial API not supported.');
        return { epc: null, error: 'Web Serial API not supported.' };
    }

    try {
        // @ts-ignore
        const port = await navigator.serial.requestPort();
        console.log("requestPort", port)
        await port.open({ baudRate: 9600 });
        console.log("port open", port)

        const reader = port.readable?.getReader();
        console.log("reader", reader)
        let epc = null;

        const startTime = Date.now();

        try {
            console.log("Try block")
            console.log(readingSeconds)
            while (Date.now() - startTime < readingSeconds*1000) {
                await waitSomeSecond(1)
                const { value, done } = await reader.read();
                console.log(done)

                if (done) {
                    reader.releaseLock();
                    break;
                }

                const textDecoder = new TextDecoder();

                // データをHEX文字列として表示する
                const toHexString = (bytes: Uint8Array): string =>
                bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

                const hexString = toHexString(new Uint8Array(value));
                console.log(`HEX Data: ${hexString}`);
                if (epc === null) {
                    epc = hexString;
                } else {
                    epc += hexString;
                }
            }
            console.log("EPC:", epc)
            if (epc !== null && epc.length >= 100) {
                console.log("判別可能");
                // "1100ee00"で分割
                epc = epc.split("1100ee00");
                // 分割した結果をSetに変換
                const epcSet = new Set(epc);

                // 条件に一致するEPCコードだけを選択し、後ろ4桁を削除
                const filteredEPCs = Array.from(epcSet).filter(epc => epc.length === 28).map(epc => epc.substring(0, 24));

                console.log("EPC:", filteredEPCs);
                return { epc: filteredEPCs, error: null };
            }
        } catch (readError) {
            console.log("Catch block")
            console.error('Reading error:', readError);
            return { epc: null, error: `Reading error: ${readError}` };
        } finally {
            if (reader) {
                await reader.releaseLock();
            }
            if (port) {
                await port.close();
            }
            console.log("Serial port closed and resources released");
        }
        return { epc: null, error: 'EPC not found' };
    } catch (error) {
        console.error('RFID Reader connection failed:', error);
        return { epc: null, error: `RFID Reader connection failed: ${error}` };
    }
};

export { serialConnectionHealthCheck, readEPCFromRFIDReader };


// const calculateCRC16 = (bytes: Uint8Array): number => {
//     // CRC16の計算ロジックを実装
//     let crc = 0xFFFF; // 初期値
//     // @ts-ignore
//     for (let b of bytes) {
//         crc = crc ^ b; // CRC16の計算処理
//     }
//     return crc;
// }
// const sendInventoryCommand = async (): Promise<{ epcs: any[]; error: any }> => {
//     if (!('serial' in navigator)) {
//         console.error("Web Serial API is not supported in this browser.");
//         return { epcs: [], error: "Web Serial API is not supported." };
//     }
//
//     try {
//         console.log("Start to send inventory command");
//         //@ts-ignore
//         const port = await navigator.serial.requestPort();
//         await port.open({ baudRate: 9600 });
//         console.log("port open", port)
//
//         const writer = port.writable.getWriter();
//         console.log("writer", writer)
//
//         // コマンドの組み立て
//         const commands = new Uint8Array([0x01]); // 0x01=Inventoryコマンド
//         const cmdLength = new Uint8Array([commands.length + 2]); // コマンド長 + CRCの2バイト
//         const crc = calculateCRC16(commands);
//         const crcBytes = new Uint8Array([crc & 0xFF, crc >> 8]);
//         //@ts-ignore
//         const commandBytes = new Uint8Array([...cmdLength, ...commands, ...crcBytes]);
//         console.log("commandBytes", commandBytes)
//
//         // コマンドを送信
//         await writer.write(commandBytes);
//         writer.releaseLock();
//
//         // 応答を読み取る
//         const reader = port.readable.getReader();
//         console.log("reader", reader)
//         let epcs: Array<string> = [];
//         console.log("pre-epcs", epcs)
//         while (true) {
//             console.log("while loop")
//             const { value, done } = await reader.read();
//             if (done) {
//                 break;
//             }
//             epcs.push(value);
//             console.log("epcs", epcs[0])
//         }
//         reader.releaseLock();
//         await port.close();
//
//         // EPCのリストを返す
//         return { epcs, error: null };
//     } catch (error) {
//         console.error("Failed to send command:", error);
//         // @ts-ignore
//         return { epcs: [], error: error.message };
//     }
// };
