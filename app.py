from main import *
from flask import Flask, render_template
import markdown

app = Flask(__name__)


@app.route("/")
@app.route("/home")
@app.route("/landing")
def home():
    links = set_active_link("home")

    return render_template("index.html", links=links)


@app.route("/about")
def about():
    links = set_active_link("about")

    skills_data = {
        "Python Development": {"icon(s)": ["python", "flask"]},
        "HTML & CSS": {"icon(s)": ["html", "css", "jinja"]},
        "Enterprise Hardware Management and Repair": {"icon(s)": ["hardDrive"]},
        "SQL (SQLite3)": {"icon(s)": ["sqlite"]},
        "Linux CLI": {"icon(s)": ["linux"]},
        "JavaScript & React": {"icon(s)": ["javascript", "react"]},
    }

    return render_template("about.html", links=links, skills_data=skills_data)


@app.route("/projects")
def projects():
    links = set_active_link("projects")

    repo_obj = reformat(get_github_repos())

    return render_template("projects.html", repos=repo_obj, links=links)


@app.route("/projects/<name>")
def project_page(name):

    repos = reformat(get_github_repos())
    repo_list = list_repo(repos)

    if name in repo_list:
        readme_path = f"static/github_cache/{name}/README.md"
        with open(readme_path, "r") as readme_file:
            content = readme_file.read()

        html_content = markdown.markdown(content)

        links = set_active_link("projects")

        return render_template(
            "project.html",
            content=html_content,
            repo_data=get_repo(repos, name),
            links=links,
        )
    else:
        return "not found"


@app.route("/contact")
def contact():
    links = set_active_link("contact")

    return render_template("contact.html", links=links)


@app.route("/hobbies")
def hobbies():
    links = set_active_link("hobbies")

    # * Move to client
    # uptime = get_uptime()
    # temp = get_temp()
    # cpu_usage = psutil.cpu_percent()

    return render_template("hosting.html", links=links)


if __name__ == "__main__":

    app.run(debug=True)
