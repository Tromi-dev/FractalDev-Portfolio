import requests
import subprocess
import os
import diskcache as dc
import psutil
import datetime
from dotenv import load_dotenv

load_dotenv()

USERNAME = os.getenv("GITHUB_USERNAME")

# Path to store the repositories locally
BASE_DIR = os.getenv("BASE_DIR")

cache = dc.Cache("cache_directory")


def get_uptime():
    try:
        with open("/proc/uptime", "r") as f:
            uptime_seconds = float(f.readline().split()[0])

        timedelta = datetime.timedelta(seconds=uptime_seconds)

        time = str(timedelta)

        return time[:-7]

    except Exception as e:
        return "Uptime is not available - Exception: " + str(e)


def get_temp():
    try:
        # Fetching temperatures from sensors
        temps = psutil.sensors_temperatures()

        if not temps:
            print("No temperature sensors found!")
        else:
            # Getting the first temperature reading
            for name, entries in temps.items():
                if entries:  # Check if entries list is not empty
                    main_temp = entries[0].current  # First temperature entry
                    return f"{main_temp}°C"

    except:
        return "Temperature Unknown"


# Function to clone or update repositories
def clone_or_update_repo(repo_url, repo_name):
    repo_path = os.path.join(BASE_DIR, repo_name)

    # If the repo directory already exists, pull the latest changes
    if os.path.exists(repo_path):
        print(f"Updating repository: {repo_name}")
        subprocess.run(["git", "-C", repo_path, "pull"], check=True)
    else:
        # Clone the repository
        print(f"Cloning repository: {repo_name}")
        subprocess.run(["git", "clone", repo_url, repo_path], check=True)


# Fetch the list of repositories from GitHub API
def get_github_repos():

    TOKEN = os.getenv("TOKEN")

    # Try to retrieve cached data
    cached_data = cache.get(USERNAME)
    if cached_data is not None:
        print("Using cached data")
        return cached_data

    # Set the headers for authentication
    headers = {"Authorization": f"token {TOKEN}"}

    url = f"http://api.github.com/users/{USERNAME}/repos"
    response = requests.get(url, headers=headers)

    # Check if the response is successful
    if response.status_code == 200:
        data = response.json()
        sorted_repos = sorted(data, key=lambda x: x["updated_at"], reverse=True)

        # Store the data in the cache with an expiration time of 24 hours
        cache.set(USERNAME, sorted_repos, expire=3600)  # 24 hours

        return {"repos": sorted_repos, "error": None}
    else:
        print(f"Error: {response.status_code} at get_github_repos(), {response.text}")
        return {"repos": None, "error": eval(response.text)}


# Main function to clone/update all repositories
def main():
    if not os.path.exists(BASE_DIR):
        os.makedirs(BASE_DIR)

    repos = get_github_repos()

    for repo in repos:
        repo_name = repo["name"]
        repo_url = repo["clone_url"]
        clone_or_update_repo(repo_url, repo_name)


def get_repos(username):
    url = "http://api.github.com/users/" + username + "/repos"
    response = requests.get(url)
    data = response.json()

    sorted_repos = sorted(data, key=lambda x: x["updated_at"], reverse=True)

    return sorted_repos


def update():
    un_repos = get_repos(USERNAME)

    repos = reformat(un_repos)

    if not os.path.exists(BASE_DIR):
        os.makedirs(BASE_DIR)

    for repo in repos:
        repo_name = repo["name"]
        repo_url = repo["clone_url"]
        clone_or_update_repo(repo_url, repo_name)


def get_repo(repos, name):
    for repo in repos:
        repo_name = repo["name"]
        if repo_name == name:
            return repo


def reformat(data):
    try:
        for repo in data["repos"]:
            repo["local_url"] = "github_cache/" + repo["name"]
            repo["page_url"] = "/projects/" + repo["name"]
            repo["watchers"] = str(repo["watchers"])
            repo["forks_count"] = str(repo["forks_count"])

            print(repo["local_url"])
    except TypeError:
        pass  # err should already be assigned in get_github_repos()
    except Exception as err:
        data["error"] = err
    finally:
        print(data)
        return data


def list_repo(repos):
    repo_list = []
    for repo in repos:
        repo_list.append(repo["name"])

    return repo_list


def set_active_link(active_route):
    links = {
        "home": {"name": "Home", "active": False},
        "about": {"name": "About", "active": False},
        "projects": {"name": "Projects", "active": False},
        "contact": {"name": "Contact", "active": False},
        "hobbies": {"name": "Hobbies", "active": False},
    }

    links[active_route].update({"active": True})
    return links
