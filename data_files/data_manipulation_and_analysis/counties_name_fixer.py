def main():
    read_file = open("covid_data.json", "r")


    temp_file = open("covid_data_adjusted.json", "w")

    line = read_file.readline()

    substring = "St. Lawrence"
    str_replaced = "St Lawrence"
    while line != "":
        if substring in line:
            temp_file.write(line[:line.index(substring)])
            temp_file.write(f'{str_replaced}')
            temp_file.writelines(line[line.index(substring) + len(substring):])
        else:
            temp_file.writelines(line)
        line = read_file.readline()

    read_file.close()
    temp_file.close()

if __name__ == "__main__":
    main()