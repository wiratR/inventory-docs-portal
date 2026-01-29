FROM golang:1.22-alpine AS builder
WORKDIR /app

RUN apk add --no-cache git ca-certificates

COPY go.mod ./
RUN go mod download

COPY . .
RUN go mod tidy

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o api ./cmd/api
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o seed ./cmd/seed

FROM alpine:3.19
WORKDIR /app
RUN apk add --no-cache ca-certificates

COPY --from=builder /app/api /app/api
COPY --from=builder /app/seed /app/seed
COPY --from=builder /app/migrations /app/migrations

EXPOSE 8080
CMD ["/app/api"]
