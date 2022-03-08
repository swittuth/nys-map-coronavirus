def main():
    data_file = open('covid_data.json', "r")

    line = data_file.readline()

    # highest number of cases
    '''
        substring = 'Cumulative Number of Positives'
        max_overall = -1
        while line != '':
            if substring in line:
                cases = int(line.split(" ")[-1].rstrip(',\n'))
                if cases > max_overall:
                    max_overall = cases
    
            line = data_file.readline()
        data_file.close()
    '''

    '''
    max_2020 = -1
    substring1 = 'Test Date'
    substring2 = 'Cumulative Number of Positives'
    while line != '':
        if substring1 in line:
            year = int(line.split('/')[-1].rstrip('",\n'))
            if year == 2020:
                while substring2 not in line:
                    line = data_file.readline()
                cases = int(line.split(" ")[-1].rstrip(',\n'))
                if cases > max_2020:
                    max_2020 = cases
        line = data_file.readline()
    data_file.close()

    print(max_2020)
    '''

    below_100k = 0
    below_400k = 0
    below_700k = 0

    substring = "Cumulative Number of Positives"
    while line != '':
        if substring in line:
            cases = int(line.split(" ")[-1].rstrip(',\n'))
            if cases <= 100000:
                below_100k += 1
            elif cases <= 400000:
                below_400k += 1
            else:
                below_700k += 1
        line = data_file.readline()

    print(below_100k)
    print(below_400k)
    print(below_700k)




if __name__ == "__main__":
    main()