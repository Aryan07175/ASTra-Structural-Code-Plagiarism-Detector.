def fibonacci(n):
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    
    sequence = [0, 1]
    while len(sequence) < n:
        next_val = sequence[-1] + sequence[-2]
        sequence.append(next_val)
        
    return sequence

if __name__ == "__main__":
    count = 10
    print(f"First {count} Fibonacci numbers: {fibonacci(count)}")
