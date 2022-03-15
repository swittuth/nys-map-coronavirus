def main():
    data_file = open("../nys_hospitalization_age_group_by_county.json", "r")
    result_file = open("../nys_hospitalization_age_group_by_county_adjusted.json", "w")

    line = data_file.readline()

    substring1 = '"",'
    substring2 = '""'
    while line != "":
        line_list = line.rstrip("\n").split(' ')
        if line_list[-1] == substring1:
            line_list[-1] = '0,'
            line = ' '.join(line_list) + "\n"
            result_file.writelines(line)
        elif line_list[-1] == substring2:
            line_list[-1] = '0'
            line = ' '.join(line_list) + "\n"
            result_file.writelines(line)
        else:
            result_file.writelines(line)

        line = data_file.readline()

    data_file.close()
    result_file.close()


if __name__ == '__main__':
    main()