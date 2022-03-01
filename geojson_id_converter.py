def main():
    id_file = open("nys_counties_id.geojson", "w")
    geojson_file = open("nys_counties.geojson", "r")

    line = geojson_file.readline()
    count = 1

    substring = '"type": "Feature",'

    while line != "":
        if substring in line:
            templine = f', "id":{count}, '
            count += 1
            id_file.write(line[:line.find(',')])
            id_file.write(templine)
            id_file.writelines(line[line.find("properties"):])
        else:
            id_file.writelines(line)
        line = geojson_file.readline()

if __name__ == "__main__":
    main()