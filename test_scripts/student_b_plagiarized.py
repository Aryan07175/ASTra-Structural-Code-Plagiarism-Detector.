def check_if_prime(number):
    # This checks if a number is prime
    if number <= 1:
        return False
        
    limit = int(number**0.5) + 1
    for divisor in range(2, limit):
        if number % divisor == 0:
            return False
            
    return True

def generate_primes(upper_bound):
    # This logic was totally written by Student B
    prime_list = []
    
    for candidate in range(2, upper_bound + 1):
        if check_if_prime(candidate):
            prime_list.append(candidate)
            
    return prime_list

if __name__ == "__main__":
    max_num = 50
    print(f"Primes up to {max_num}: {generate_primes(max_num)}")
