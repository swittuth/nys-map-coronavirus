def main():
    fatal_data_file = open('../nys_covid_fatalities_by_county.json')
    sub1 = 'Place of Fatality'
    sub2 = 'Deaths by County of Residence'

    line = fatal_data_file.readline()

    t1 = 0
    t2 = 0
    while line != '':
        if sub1 in line:
            t1 += int(line.split(" ")[-1].rstrip(',\n'))
        elif sub2 in line:
            t2 += int(line.split(" ")[-1].rstrip('\n'))
        line = fatal_data_file.readline()

    # t2 doesn't account for those who passed away out of state
    print(t1)
    print(t2)

    fatal_data_file.close()


if __name__ == '__main__':
    main()