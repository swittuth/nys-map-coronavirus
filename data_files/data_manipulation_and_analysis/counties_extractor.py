def main():
    counties_file = open("counties.txt", "r")
    counties_list = []

    counties = counties_file.readline()

    while counties != '':
        if "St Lawrence" in counties:
            counties_list.append(counties.split(" ")[0] + " " + counties.split(" ")[1])
        else:
            counties_list.append(counties.split(" ")[0])
        counties = counties_file.readline()

    print(counties_list)

if __name__ == "__main__":
    main()