import requests
import time
import urllib3

# Tắt cảnh báo SSL không tin cậy của urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BASE_URL = "https://api.batubatu.id.vn/api/v1"
LOGIN_ENDPOINT = f"{BASE_URL}/auth/login"
CUSTOMERS_ENDPOINT = f"{BASE_URL}/customers"

def run_test():
    print("=" * 60)
    print("MÔ PHỎNG TẤN CÔNG CÀO DỮ LIỆU KHÁCH HÀNG VIP QUA CLOUDFLARE WAF")
    print("=" * 60)

    # Bước 1: Đăng nhập để lấy JWT Token
    print(f"[*] Đang thực hiện đăng nhập qua Cloudflare HTTPS...")
    login_data = {
        "username": "letan01",
        "password": "password123"
    }

    try:
        # Gửi request login qua internet đến Cloudflare
        response = requests.post(LOGIN_ENDPOINT, json=login_data, verify=False, timeout=10)
        if response.status_code != 200:
            print(f"[!] Đăng nhập thất bại. Status code: {response.status_code}")
            print(response.text)
            return
        
        # Nhận JWT Token
        result = response.json()
        token = result.get("token") or result.get("data", {}).get("token")
        
        if not token:
            print("[!] Không tìm thấy JWT Token trong response đăng nhập.")
            print(result)
            return

        print(f"[+] Đăng nhập thành công! JWT Token (đã rút gọn): {token[:20]}...{token[-20:]}")
        print("[+] Kết nối HTTPS đã mã hóa thành công qua Cloudflare Edge.")
    except Exception as e:
        print(f"[!] Lỗi kết nối đến Cloudflare: {e}")
        return

    # Bước 2: Dùng token cào dữ liệu (Gửi 15 request liên tục)
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    print("\n[*] Bắt đầu spam 15 request cào API GET /api/v1/customers liên tiếp qua Cloudflare...")
    success_count = 0
    blocked_count = 0

    for i in range(1, 16):
        try:
            start_time = time.time()
            res = requests.get(CUSTOMERS_ENDPOINT, headers=headers, verify=False, timeout=10)
            duration = (time.time() - start_time) * 1000

            if res.status_code == 200:
                success_count += 1
                data_preview = res.text[:80].replace('\n', '')
                print(f"Request {i:02d}: [🟢 SUCCESS - 200 OK] ({duration:.1f}ms) -> Data: {data_preview}...")
            elif res.status_code == 429:
                blocked_count += 1
                # Lấy tin nhắn từ Cloudflare WAF hoặc Spring Boot
                try:
                    error_msg = res.json().get("message", "Bị chặn do kích hoạt Rate Limiting")
                except:
                    error_msg = "Blocked by Cloudflare WAF (Status 429)"
                print(f"Request {i:02d}: [🔴 BLOCKED - 429 Too Many Requests] ({duration:.1f}ms) -> {error_msg}")
            elif res.status_code == 403:
                blocked_count += 1
                print(f"Request {i:02d}: [🔴 BLOCKED - 403 Forbidden] ({duration:.1f}ms) -> Blocked by Cloudflare WAF Security")
            else:
                print(f"Request {i:02d}: [⚠️ ERROR - {res.status_code}] ({duration:.1f}ms) -> {res.text[:100]}")
        except Exception as e:
            print(f"Request {i:02d}: [💥 EXCEPTION] -> {e}")
        
        # Spam cực nhanh
        time.sleep(0.05)

    print("\n" + "=" * 60)
    print("KẾT QUẢ ĐÁNH GIÁ PHÒNG NGỰ:")
    print(f" - Tổng số request gửi đi: 15")
    print(f" - Thành công (Lấy được dữ liệu): {success_count}/10")
    print(f" - Bị chặn (Rate Limit / WAF chặn đứng): {blocked_count}/5")
    if blocked_count > 0:
        print("[🛡️] ĐÁNH GIÁ: Phòng ngự THÀNH CÔNG! Cloudflare WAF / Rate Limiter đã chặn đứng script cào dữ liệu.")
    else:
        print("[🚨] ĐÁNH GIÁ: Phòng ngự THẤT BẠI. Hãy kiểm tra cấu hình WAF của bạn.")
    print("=" * 60)

if __name__ == "__main__":
    run_test()
