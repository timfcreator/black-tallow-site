# Black Tallow website

The website for Black Tallow, built with [Eleventy](https://www.11ty.dev/) and published on GitHub Pages.
Every push to `main` rebuilds the site and publishes it about a minute later.

- [Run it on your machine](#run-it-on-your-machine)
- [Publish a devlog post](#publish-a-devlog-post)
- [Settings: site.json](#settings-sitejson)
- [Pictures and art](#pictures-and-art)
- [Going live (one time)](#going-live-one-time)
- [How publishing works](#how-publishing-works)
- [Where things are](#where-things-are)

## Run it on your machine

You need Node.js 24 (LTS). In this folder, once:

```
npm install
```

Then:

| Command | What it does |
|---|---|
| `npm start` | Serves the site at **http://localhost:8090** and reloads the page whenever you save a file. (Not 8080: on this PC the Unity bridge uses that port.) |
| `npm run build` | Writes the finished site to `_site/`. |
| `npm run check` | Builds the site, then checks every internal link. GitHub runs the same check before publishing. |
| `npm run images` | Turns the art in `src/assets/art/` into the files the pages use. See [Pictures and art](#pictures-and-art). |

`npm start` shows two things the published site does not: **draft posts**, and a **dashed amber TODO box**
wherever a setting in `site.json` is still empty. The published site leaves out anything whose setting is
empty, so nothing ever shows up broken.

If a file you just created does not appear under `npm start`, stop it (Ctrl+C) and run `npm start` again.

## Publish a devlog post

1. **Copy** `src/devlog/2026-11-20-example.md` and rename the copy `YYYY-MM-DD-short-name.md`, for example
   `2026-11-20-first-light.md`. The date is the post's date. The rest becomes its address:
   `/devlog/first-light/`. Use lower-case words joined by hyphens.
2. **Fill in the front matter** (the block between the two `---` lines):

   | Field | |
   |---|---|
   | `title` | The post's heading. |
   | `date` | The same date as in the file name, `YYYY-MM-DD`. |
   | `summary` | One line, shown in the devlog list, the feed and link previews. |
   | `image` | Optional: a picture at the top of the post, such as `img/cart.png`. At 1200 px wide or more it is also the post's link preview. |
   | `imageAlt` | Needed with `image`: what the picture shows, for people who cannot see it. |
   | `draft` | Leave `draft: true` while you write. The post shows under `npm start` but is not published. |

3. **Write** the post in Markdown under the front matter. The example post shows headings, lists, quotes and
   code. Put pictures in `src/devlog/img/` (PNG or JPEG is fine; the build turns them into WebP), then:
   - a picture: `![What the picture shows.](img/cart.png)`
   - a picture with a caption: `{% figure "img/cart.png", "What the picture shows.", "The caption." %}`
4. **Preview** it: run `npm start` and open http://localhost:8090/devlog/.
5. **When it is ready**, delete the line `draft: true`, then run `npm run check`.
6. **Commit and push:**

   ```
   git add src/devlog
   git commit -m "Devlog: First light"
   git push
   ```

7. **It goes live about a minute later.** Watch it on the repository's **Actions** tab. A green tick means it is
   published. A red cross means something stopped it: open the run to see the message. The live site stays
   as it was until the problem is fixed.

The build refuses a post with no `title` or `summary`, a file not named `YYYY-MM-DD-...md`, a front-matter `date`
that differs from the file name's date, or an `image` without `imageAlt`, and says which.

## Settings: site.json

Every link and ID lives in `src/_data/site.json`. Edit the value between the quotes. **Leave a value empty
(`""`) and the site hides whatever uses it.** Everything in this file ends up on the public site, so nothing in
it is secret. That includes the Cloudflare token, which is in every page by design.

| Setting | What to put in it | Where it shows |
|---|---|---|
| `name`, `tagline` | The game's name and tagline. | Page titles, the home page, the feed. |
| `description` | One or two sentences. | Search results and link previews. |
| `domain` | The bare domain, like `blacktallow.com` (no `https://`). | The `CNAME` file, and full addresses when you build on your own machine. Once the domain is connected on GitHub, the published site uses it automatically. |
| `discordInvite` | A Discord invite link set to **never expire**, like `https://discord.gg/abc123`. | The hero's Join the Discord button, the footer. |
| `emailFormAction` | Your signup form's address. **Buttondown:** `https://buttondown.com/api/emails/embed-subscribe/<your username>`. **Kit:** `https://app.kit.com/forms/<form number>/subscriptions`. The site works out which provider it is from the address. | The Get updates by email button and section, the privacy note. |
| `social.bluesky`, `.youtube`, `.reddit`, `.itch` | The full address of each profile, like `https://bsky.app/profile/blacktallow.bsky.social`. | The footer, the privacy note. |
| `contactEmail` | The address people can write to. | The footer, the privacy note. |
| `companyName`, `abn` | The company's name and ABN. | The footer: "Black Tallow is made by ... ABN ...". |
| `cloudflareAnalyticsToken` | Only the token from Cloudflare's snippet, the part after `"token": `. | Turns on cookieless visit counting; the privacy note says so. |
| `steamUrl` | The Steam store page's address, once it exists. | Adds a Wishlist on Steam button and makes it the main one. |

## Pictures and art

**The title art is temporary.** It was cut from the Steam capsule art. To replace it, export these PNGs on
black, at exactly these sizes, into `src/assets/art/` with these names:

| File | Size | Used for |
|---|---|---|
| `hero-wide.png` | 2400 × 1200 | The home page on wider screens. |
| `hero-stacked.png` | 1080 × 1350 | The home page on phones (BLACK above TALLOW above the candle). |
| `wordmark.png` | 695 × 234 | The small logo at the top of the other pages. |
| `og-image.png` | 1200 × 630 | The picture in link previews. |
| `candle.png` | 512 × 512 | The browser-tab icon and phone home-screen icons. |
| `candle-32.png` (optional) | 32 × 32 | A hand-pixelled browser-tab icon, sharper than a scaled-down candle. |

Then run `npm run images`, check the result with `npm start`, and commit the PNGs together with what the
command wrote (`src/assets/img/`, `src/assets/icons/`, `src/_data/images.json`). Update `ASSETS.md` to match.

**A picture or clip for one of the four home blocks.** Save it in `src/assets/img/` (WebP, about 1200 px wide)
and, for a clip, an MP4 in `src/assets/video/`. Then, in `src/index.njk`, give the block a third value. For
example, change `{% call ui.feature("cart", "The cart") %}` to:

```
{% call ui.feature("cart", "The cart", { src: "/assets/img/cart.webp", width: 1200, height: 675, alt: "What it shows." }) %}
```

For a clip, add `video: "/assets/video/cart.mp4"` inside the braces: the picture becomes its first frame,
and it shows instead of the clip for anyone who has asked their system for reduced motion.

## Going live (one time)

Do these in order. Nothing here costs money apart from the domain.

**0. Before the first push, decide which email your commits show.** On a public repository anyone can read
the email address on every commit; at the moment that is your personal address. To use GitHub's private one:

1. On GitHub: your picture, then **Settings > Emails**. Tick **Keep my email addresses private**, and copy
   the address it shows, ending `@users.noreply.github.com`.
2. In this folder:

   ```
   git config user.email "<the address you copied>"
   git rebase -r --root --exec "git commit --amend --no-edit --reset-author"
   git log --format="%h %ae %s"
   ```

   The last command should list every commit with the new address.

**1. Create the repository.** Go to https://github.com/new. Owner `timfcreator`; name it, for example
`black-tallow-site`; choose **Public** (GitHub Pages on a free account needs it). Add no README, .gitignore or
licence. Click **Create repository**. If you choose another name, use it wherever `black-tallow-site`
appears below.

**2. Push the site.** In this folder:

```
git remote add origin https://github.com/timfcreator/black-tallow-site.git
git push -u origin main
```

The first run on the **Actions** tab fails at "Read the Pages address", because Pages is not switched on yet.
That is expected; the next step fixes it.

**3. Switch Pages on.** In the repository: **Settings > Pages**. Under **Build and deployment**, set **Source**
to **GitHub Actions**. Then open the **Actions** tab, click the failed run, and click **Re-run all jobs**. When
it shows a green tick, the site is live at `https://timfcreator.github.io/black-tallow-site/`.

**4. Verify the domain with GitHub.** GitHub recommends doing this before step 6, because it stops anyone else
attaching your domain to their own GitHub site. Your picture, then **Settings > Pages** (in the left-hand list,
under "Code, planning, and automation"). Click **Add a domain** and enter the domain. GitHub shows a TXT record:
add it at your registrar (step 5 explains where), wait a few minutes, then click **Verify**. GitHub shows the
record's name as `_github-pages-challenge-timfcreator.blacktallow.com`; most registrars want only the part
before your domain (`_github-pages-challenge-timfcreator`) in the name box, because they add the domain
themselves.

**5. Point the domain at GitHub.** At your domain registrar, in the DNS settings for the domain:

| Type | Name (host) | Value |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `timfcreator.github.io` |

Delete any other A, AAAA or ALIAS records on `@`, such as a registrar's parking page. Optionally, add four AAAA
records on `@` as well (`2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`,
`2606:50c0:8003::153`) so visitors on IPv6 connect directly. DNS changes can take from minutes to a day.

**6. Connect the domain.** In the repository: **Settings > Pages > Custom domain**. Enter the domain without
`www` (`blacktallow.com`) and click **Save**. Wait until it says the DNS check succeeded.

**7. Turn on HTTPS.** On the same page, tick **Enforce HTTPS**. If the box is greyed out, GitHub is still
issuing the certificate. Come back in an hour; it can take up to a day. Until then a browser may warn that the
site is not secure when you open it on the domain. That is expected and goes away once the box is ticked.

**8. Put the domain in `site.json`.** Set `domain`, then commit and push. From now on every address the site
gives out (link previews, the feed, search results) uses the domain.

## How publishing works

`.github/workflows/deploy.yml` runs on every push to `main`. It installs the packages, builds the site, checks
every internal link, and publishes the result to GitHub Pages. If the build or the link check fails, nothing is
published and the live site stays as it was. You can also start it by hand: **Actions > Deploy to GitHub Pages >
Run workflow**.

Before the domain is connected, the site lives in a subfolder (`https://timfcreator.github.io/black-tallow-site/`).
The workflow asks GitHub where the site is served and builds for that address, so it works in the subfolder
and on the domain without changes.

## Where things are

```
src/
  index.njk               the home page (the hero, the pitch, the four blocks, devlog, signup, About)
  devlog/                 devlog posts, and their pictures in devlog/img/
  devlog.njk              the list of all posts, /devlog/
  feed.njk                the Atom feed, /devlog/feed.xml
  privacy.njk, 404.njk    the privacy note and the not-found page
  _data/site.json         every link and ID (see Settings)
  _includes/              the shared page layout, header, footer and post layout
  assets/css/site.css     all the styles
  assets/art/             the PNG art exports (sources for npm run images; never published as they are)
scripts/                  npm run images and the link checker
ASSETS.md                 every font and picture, where it came from, and its licence
```
