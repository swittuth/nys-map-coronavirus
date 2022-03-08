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

    print(len(tint_array))


if __name__ == '__main__':
    main()