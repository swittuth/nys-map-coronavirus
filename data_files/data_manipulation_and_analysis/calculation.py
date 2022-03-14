def main():
    fatal_data_file = open('../csv_number_files/nys_covid_fatal_data.csv')


    line = fatal_data_file.readline()
    substring = 'Albany'
    t1 = 0
    while line != '':
        string_array = line.split(',')
        cases = string_array[3]
        if substring in string_array:
                print(cases)
                t1 += int(cases)

        line = fatal_data_file.readline()

    # t2 doesn't account for those who passed away out of state
    print(t1)

    fatal_data_file.close()


if __name__ == '__main__':
    main()