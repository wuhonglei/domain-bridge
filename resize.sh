# 安装后执行（macOS 可用 brew install imagemagick）
for s in 16 32 48 64 128 256; do
  convert imgs/icon.png -resize ${s}x${s} public/icon/${s}.png
done