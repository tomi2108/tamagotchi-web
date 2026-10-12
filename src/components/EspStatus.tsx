// import { useEffect, useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
// import { Skeleton } from './ui/skeleton';
// import { Alert, AlertDescription } from './ui/alert';
//
// type Device = {
//   name: string;
//   online: boolean;
// };
//
// function StatusDot({ online }: { online: boolean }) {
//   return (
//     <span
//       className={`h-2.5 w-2.5 rounded-full ${online ? 'bg-green-500' : 'bg-gray-500'
//         }`}
//     />
//   );
// }
//
// async function getStatus(): Promise<Device[]> {
//   const response = await fetch('/api/status');
//
//   if (!response.ok) {
//     throw new Error('Failed to fetch device status');
//   }
//
//   return response.json();
// }
//
// function EspStatus() {
//   const [devices, setDevices] = useState<Device[] | null>(null);
//
//   useEffect(() => {
//     const poll = async () => {
//       try {
//         const status = await getStatus();
//         setDevices(status);
//       } catch {
//         // Keep the current state if polling fails.
//       }
//     };
//
//     poll();
//
//     const interval = setInterval(poll, 5000);
//
//     return () => clearInterval(interval);
//   }, []);
//
//   return (
//     <Card className="w-full max-w-sm">
//       <CardHeader>
//         <CardTitle>ESP32</CardTitle>
//       </CardHeader>
//
//       <CardContent className="flex flex-col gap-3">
//         {devices === null && (
//           <>
//             <Skeleton className="h-5 w-full" />
//             <Skeleton className="h-5 w-full" />
//           </>
//         )}
//
//         {devices?.length === 0 && (
//           <Alert>
//             <AlertDescription>
//               No devices found.
//             </AlertDescription>
//           </Alert>
//         )}
//
//         {devices?.map((device) => (
//           <div
//             key={device.name}
//             className="flex items-center justify-between"
//           >
//             <span>{device.name}</span>
//
//             <div className="flex items-center gap-2">
//               <StatusDot online={device.online} />
//               <span className="text-sm text-muted-foreground">
//                 {device.online ? 'Online' : 'Offline'}
//               </span>
//             </div>
//           </div>
//         ))}
//       </CardContent>
//     </Card>
//   );
// }
//
// export default EspStatus;
