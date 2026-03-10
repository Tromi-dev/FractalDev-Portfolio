import psutil

# Fetching temperatures from sensors
temps = psutil.sensors_temperatures()

if not temps:
    print("No temperature sensors found!")
else:
    # Getting the first temperature reading
    for name, entries in temps.items():
        if entries:  # Check if entries list is not empty
            main_temp = entries[0].current  # First temperature entry
            print(f"Main temperature: {main_temp}°C")
            break