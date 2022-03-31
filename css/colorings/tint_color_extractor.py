def main():
    tint_file = open('tint_color.txt', 'r')

    line = tint_file.readline()
    substring = '#'
    tint_array = []

    while line != '':
        if substring in line:
            tint = line.split(' ')[0].rstrip('\n')

            tint_array.append(tint)

        line = tint_file.readline()

    for i in range(0, len(tint_array)):
        if i == 0:
            print('[', end='')
        print(f"'{tint_array[i]}'", end=', ')
        if i == (len(tint_array) - 1):
            print(']')
        if (i - 1) % 10 == 0:
            print('\n', end='')




if __name__ == '__main__':
    main()