This directory contains individual markdown files for each service that can be categorized as EU or non-EU services.

## Directory Structure

Services are organized into two subdirectories:
- `/eu/` - Contains services based in EU countries
- `/non-eu/` - Contains services based outside the EU

## File Naming

- Use lowercase names with hyphens for spaces: `service-name.md`
- Keep names simple and recognizable: `protonmail.md`, `tutanota.md`, etc.

## Required Frontmatter

Each service file must include the following frontmatter:

```yaml
---
name: 'Service Name'            # Display name of the service
category: 'category-name'       # Must match one of the existing categories (email, storage, etc.)
location: 'Country'             # Country or region where the service is based
region: 'eu'                    # Either 'eu' or 'non-eu'
freeOption: true                # Whether a free tier is available
startingPrice: '€X.XX/month'    # Starting price for paid plans
description: 'Brief description of the service.'
url: 'https://service-url.com'  # Official website URL
---
```

## Optional Frontmatter

You can also include these optional fields:

```yaml
logo: 'path/to/logo.svg'        # Path to the service logo (relative to public directory)
features:                        # List of key features
  - 'Feature one'
  - 'Feature two'
tags:                           # Tags for filtering/categorization
  - 'tag1'
  - 'tag2'
featured: true                  # Whether to show this service on the featured section
```

## Content

After the frontmatter, you can include additional markdown content describing the service in more detail.

## Examples

### EU Service Example

```markdown
---
name: 'ProtonMail'
category: 'email'
location: 'Switzerland'
region: 'eu'
freeOption: true
startingPrice: '€3.99/month'
description: 'End-to-end encrypted email service with strong privacy focus.'
url: 'https://proton.me/mail'
features:
  - 'End-to-end encryption'
  - 'Zero-access encryption'
  - 'Open source clients'
---

ProtonMail is an encrypted email service founded in 2013 at CERN by scientists who met there and were concerned about the privacy implications of services like Gmail.

## Key Benefits

- End-to-end encryption ensures that only you and your recipient can read the emails
- Based in Switzerland, which has strong privacy laws
- Available on all major platforms, including web, iOS, and Android
```

### Non-EU Service Example

```markdown
---
name: 'Gmail'
category: 'email'
location: 'United States'
region: 'non-eu'
freeOption: true
startingPrice: false
description: 'Google email service with powerful features but limited privacy.'
url: 'https://gmail.com'
features:
  - 'Advanced search capabilities'
  - 'Integration with Google Workspace'
  - 'Large free storage'
---

Gmail is Google's email service that offers extensive features but with privacy trade-offs due to data processing practices.

## Key Points

- One of the most widely used email services globally
- Uses data for ad targeting and AI training
- Based in the US with different privacy regulations than EU
```