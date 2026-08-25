$code = @'
using System;
using System.IO;
using System.Runtime.InteropServices;
using Microsoft.Win32.SafeHandles;

public class CloudFiles {
    [DllImport("cldapi.dll", SetLastError = true)]
    public static extern int CfHydratePlaceholder(
        SafeFileHandle fileHandle,
        long startingOffset,
        long length,
        uint hydrateFlags,
        IntPtr overlapped
    );

    public static int Hydrate(string path) {
        try {
            using (FileStream fs = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite)) {
                return CfHydratePlaceholder(fs.SafeFileHandle, 0, -1, 0, IntPtr.Zero);
            }
        } catch (Exception ex) {
            Console.WriteLine("Error opening " + path + ": " + ex.Message);
            return -1;
        }
    }
}
'@

Add-Type -TypeDefinition $code

$files = @("server.js", "discover.html", "solutions.html", "README.md")
foreach ($f in $files) {
    $fullPath = Join-Path (Get-Location) $f
    if (Test-Path $fullPath) {
        $res = [CloudFiles]::Hydrate($fullPath)
        Write-Host "$f hydration result: $res"
    }
}
