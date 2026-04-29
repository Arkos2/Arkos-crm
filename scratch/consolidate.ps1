
$outputFile = "c:\Users\Sandr\Downloads\ARKOS\arkos_full_source.txt"
if (Test-Path $outputFile) { Remove-Item $outputFile }

$paths = @("c:\Users\Sandr\Downloads\ARKOS", "c:\Users\Sandr\Downloads\ARKOS-Sofia")
$exclude = "node_modules|\.next|\.git|\.vercel|\.wrangler|public|package-lock\.json|\.env|dist|build|\.open-next|cloudflare-deploy|arkos_full_source\.txt"

foreach ($p in $paths) {
    Get-ChildItem -Path $p -Recurse | Where-Object { 
        $_.PSIsContainer -eq $false -and 
        $_.FullName -notmatch $exclude -and 
        ($_.Extension -match "\.(ts|tsx|js|jsx|json|mjs|css|md|sh|bat|jsonc)$") 
    } | ForEach-Object {
        if (Test-Path $_.FullName) {
            "========================================" | Out-File -FilePath $outputFile -Append -Encoding utf8
            "ARQUIVO: $($_.FullName)" | Out-File -FilePath $outputFile -Append -Encoding utf8
            "========================================" | Out-File -FilePath $outputFile -Append -Encoding utf8
            Get-Content $_.FullName | Out-File -FilePath $outputFile -Append -Encoding utf8
            "`n" | Out-File -FilePath $outputFile -Append -Encoding utf8
        }
    }
}
