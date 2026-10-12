Add-Type -AssemblyName System.Drawing

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$projectRoot = Split-Path -Parent $scriptDir
$assetsDir = Join-Path $projectRoot "app-store-assets"
if (-not (Test-Path $assetsDir)) {
    New-Item -ItemType Directory -Path $assetsDir | Out-Null
}

$uploadedDir = "C:\Users\obake\.gemini\antigravity-ide\brain\626238ae-f94c-4640-8a48-b6f46d9e78a2\.user_uploaded"
$imgHome = "$uploadedDir\media_1791778695412.jpg"
$imgTimeline = "$uploadedDir\media_1791778695533.jpg"
$imgChecklist = "$uploadedDir\media_1791778695563.jpg"
$imgBudget = "$uploadedDir\media_1791778695365.jpg"

Write-Host "Creating assets for Dynamic Island Medium Display (1179 x 2556 px)..."

$screenList = @(
    @{ Path = $imgHome; Name = "iphone_1_home_1179x2556.png" },
    @{ Path = $imgTimeline; Name = "iphone_2_timeline_1179x2556.png" },
    @{ Path = $imgChecklist; Name = "iphone_3_checklist_1179x2556.png" },
    @{ Path = $imgBudget; Name = "iphone_4_budget_1179x2556.png" }
)

# 1. 1179 x 2556 px 生成 (中型ディスプレイぴったり)
foreach ($item in $screenList) {
    $outPath = Join-Path $assetsDir $item.Name
    $targetW = 1179
    $targetH = 2556

    $bmp = New-Object System.Drawing.Bitmap $targetW, $targetH
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.Clear([System.Drawing.Color]::FromArgb(248, 250, 252))

    if (Test-Path $item.Path) {
        $srcImg = [System.Drawing.Image]::FromFile($item.Path)
        
        $scale = [Math]::Min($targetW / $srcImg.Width, $targetH / $srcImg.Height)
        $drawW = [int]($srcImg.Width * $scale)
        $drawH = [int]($srcImg.Height * $scale)
        $drawX = [int](($targetW - $drawW) / 2)
        $drawY = [int](($targetH - $drawH) / 2)

        $g.DrawImage($srcImg, $drawX, $drawY, $drawW, $drawH)
        $srcImg.Dispose()
    }

    $g.Dispose()
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Generated: $($item.Name)"
}

# 2. iPad用 (2048 x 2732 px) も作成
$ipadList = @(
    @{ Path = $imgHome; Name = "ipad_1_home_2048x2732.png" },
    @{ Path = $imgTimeline; Name = "ipad_2_timeline_2048x2732.png" },
    @{ Path = $imgChecklist; Name = "ipad_3_checklist_2048x2732.png" },
    @{ Path = $imgBudget; Name = "ipad_4_budget_2048x2732.png" }
)

foreach ($item in $ipadList) {
    $outPath = Join-Path $assetsDir $item.Name
    $targetW = 2048
    $targetH = 2732

    $bmp = New-Object System.Drawing.Bitmap $targetW, $targetH
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.Clear([System.Drawing.Color]::FromArgb(248, 250, 252))

    if (Test-Path $item.Path) {
        $srcImg = [System.Drawing.Image]::FromFile($item.Path)
        
        $scale = [Math]::Min($targetW / $srcImg.Width, $targetH / $srcImg.Height)
        $drawW = [int]($srcImg.Width * $scale)
        $drawH = [int]($srcImg.Height * $scale)
        $drawX = [int](($targetW - $drawW) / 2)
        $drawY = [int](($targetH - $drawH) / 2)

        $g.DrawImage($srcImg, $drawX, $drawY, $drawW, $drawH)
        $srcImg.Dispose()
    }

    $g.Dispose()
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Generated: $($item.Name)"
}

Write-Host "ALL_SIZED_ASSETS_SUCCESS"
