def is_prime(n):
    if n <= 1:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True

def get_primes_up_to(max_val):
    primes = []
    for num in range(2, max_val + 1):
        if is_prime(num):
            primes.append(num)
    return primes

if __name__ == "__main__":
    limit = 50
    print(f"Primes up to {limit}: {get_primes_up_to(limit)}")
