def main():
    data_file = open('covid_data.json', "r")
    substring = 'Cumulative Number of Positives'

    line = data_file.readline()

    # highest number of cases
    max = -1
    while line != '':
        if substring in line:
            cases = int(line.split(" ")[-1].rstrip(',\n'))
            if cases > max:
                max = cases

        line = data_file.readline()

    print(max)


    data_file.close()

if __name__ == "__main__":
    main()