# Mây mở đầu – Học mà chơi Cấp 1 (điện thoại)

Video mây dạt sang 2 cạnh, phát lần đầu trong ngày trên bản đồ Học mà chơi Cấp 1, chỉ trên điện thoại (Vũ 26/11/2026).

| File | Dùng cho | Ghi chú |
|---|---|---|
| `cloud-intro.webm` | Android (Chrome, Samsung Internet, Firefox) | 720x1280, 10s, 24fps, VP9 có alpha (file gốc của anh Vũ) |
| `cloud-intro-ios.mp4` | iPhone (mọi trình duyệt trên iOS) | 720x2560 H.264, "alpha xếp chồng": nửa trên = màu, nửa dưới = độ trong. App ghép lại bằng WebGL |
| `cloud-intro-poster.webp` | Mọi máy | Khung hình đầu (mây phủ kín), hiện ngay trong lúc video đang tải |

iOS Safari không phát được WebM có alpha, và bản HEVC nhận ngày 26/11 không có lớp alpha, nên iPhone dùng bản xếp chồng.
Tạo lại bản iOS từ file WebM:

```
ffmpeg -c:v libvpx-vp9 -i cloud-intro.webm -filter_complex "[0:v]format=rgba,split[a][b];[a]format=rgb24[c];[b]alphaextract,format=rgb24[al];[c][al]vstack,format=yuv420p" -c:v libx264 -profile:v high -preset slow -crf 23 -tune animation -movflags +faststart -an cloud-intro-ios.mp4
```
