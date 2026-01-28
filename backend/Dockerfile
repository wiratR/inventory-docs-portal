FROM golang:1.22-alpine AS builder
WORKDIR /app

# 1) copy go.mod ก่อน
COPY go.mod ./

# 2) download deps + generate go.sum ใน container
RUN go mod download

# 3) copy source ทั้งหมด (รวม migrations)
COPY . .

# 4) ensure go.sum ถูก generate/อัปเดตจาก source จริง (กัน error missing go.sum)
RUN go mod tidy

# 5) build
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o api ./cmd/api

FROM alpine:3.19
WORKDIR /app
COPY --from=builder /app/api /app/api
COPY --from=builder /app/migrations /app/migrations
EXPOSE 8080
CMD ["/app/api"]
