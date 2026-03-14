from flask import *
import requests
import subprocess
import os
import markdown
import diskcache as dc
import psutil
import datetime
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

API_URL = os.getenv('API_URL')
USERNAME = os.getenv('GITHUB_USERNAME')


# Path to store the repositories locally
BASE_DIR = os.getenv('BASE_DIR')

cache = dc.Cache('cache_directory')

def get_uptime():
    try:
        with open('/proc/uptime', 'r') as f:
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
        subprocess.run(['git', '-C', repo_path, 'pull'], check=True)
    else:
        # Clone the repository
        print(f"Cloning repository: {repo_name}")
        subprocess.run(['git', 'clone', repo_url, repo_path], check=True)


# Fetch the list of repositories from GitHub API
def get_github_repos():

    TOKEN = os.getenv('TOKEN')

    # url = f"http://api.github.com/users/{USERNAME}/repos"

    # Try to retrieve cached data
    cached_data = cache.get(USERNAME)
    if cached_data is not None:
        print("Using cached data")
        return cached_data

    # Set the headers for authentication
    headers = {
        'Authorization': f'token {TOKEN}'
    }

    response = requests.get(API_URL, headers=headers)

    # Check if the response is successful
    if response.status_code == 200:
        data = response.json()
        sorted_repos = sorted(data, key=lambda x: x['updated_at'], reverse=True)

        # Store the data in the cache with an expiration time of 24 hours
        cache.set(USERNAME, sorted_repos, expire=3600)  # 24 hours

        return sorted_repos
    else:
        print(f"Error: {response.status_code}, {response.text}")
        return None


# Main function to clone/update all repositories
def main():
    if not os.path.exists(BASE_DIR):
        os.makedirs(BASE_DIR)

    repos = get_github_repos()

    for repo in repos:
        repo_name = repo['name']
        repo_url = repo['clone_url']
        clone_or_update_repo(repo_url, repo_name)


def get_repos(username):
    url = "http://api.github.com/users/" + username + "/repos"
    response = requests.get(url)
    data = response.json()

    sorted_repos = sorted(data, key=lambda x: x['updated_at'], reverse=True)

    return sorted_repos

def update():
    un_repos = get_repos(USERNAME)

    repos = reformat(un_repos)


    if not os.path.exists(BASE_DIR):
        os.makedirs(BASE_DIR)



    for repo in repos:
        repo_name = repo['name']
        repo_url = repo['clone_url']
        clone_or_update_repo(repo_url, repo_name)


def get_repo(repos, name):
    for repo in repos:
        repo_name = repo['name']
        if repo_name == name:
            return repo

def reformat(repos):
    for repo in repos:
        repo['local_url'] = "github_cache/" + repo['name']
        repo['page_url'] = "/projects/" + repo['name']
        repo["watchers"] = str(repo['watchers'])
        repo["forks_count"] = str(repo['forks_count'])

        print(repo['local_url'])

    return repos


def list_repo(repos):
    repo_list = []
    for repo in repos:
        repo_list.append(repo["name"])


    return repo_list




def set_active_link(active_route):
    links = {
        'landing': {'name': 'landing', 'active': False},
        'about': {'name': 'about', 'active': False},
        'projects': {'name': 'projects', 'active': False},
        'contact': {'name': 'contact', 'active': False},
        'webhosting': {'name': 'webhosting', 'active': False},
    }
    links[active_route].active = True
    return links
    

@app.route('/')
@app.route('/home')
@app.route('/landing')
def landing():
    links = set_active_link('landing')

    return render_template("landing.html", links=links)

@app.route('/about')
def about():
    links = set_active_link('about')

    return render_template("about.html", links=links)

@app.route('/projects')
def projects():
    links = set_active_link('projects')

    repos = reformat(get_github_repos())
    return render_template("projects.html", repos=repos, links=links)

@app.route('/projects/<name>')
def project_page(name):

    repos = reformat(get_github_repos())
    repo_list = list_repo(repos)

    if name in repo_list:
        readme_path = f'static/github_cache/{name}/README.md'
        with open(readme_path, 'r') as readme_file:
            content = readme_file.read()

        html_content = markdown.markdown(content)

        links = set_active_link('projects')

        return render_template('project.html', content=html_content, repo_data=get_repo(repos, name), links=links)
    else:
        return "not found"

@app.route('/contact')
def contact():
    links = set_active_link('contact')

    return render_template("contact.html", links=links)

@app.route('/webhosting')
def host():
    links = set_active_link('webhosting')

    uptime = get_uptime()
    temp = get_temp()
    cpu_usage = psutil.cpu_percent()
    
    return render_template("hosting.html", uptime=uptime, temp=temp, cpu_usage=cpu_usage, links=links)


if __name__ == '__main__':

    app.run()
