# The FamQuest App

A map guiding users on an adventure to uncover family memories and history, while creating their own in a gamified quest to resolve adulting tasks.

## Repo structure

- assets: Assets involved in the system as external git repos. Includes libraries, SDKs, repos for local reference...
- .github: CICD
- components: Source code of each custom component. Develop, install and test in isolation. 
  - docs: Low Level docs
  - install: dockerfile and scripts to install/build the component
  - tools: Custom tools
- deploy: Instructions to deploy components as part of the an E2E system including instructions to deploy opensource components which are required
- docs: High level docs
- external: Directory ignored to be able to host local git submodules of thirdparty software of interest but not extended by us.
- tools: Custom tools 

## High Level description

"FamQuest" is born as the 1-year bday present for my first nephew, Jaime, which aims to create a one-to-one online experience which rewards schores with adventures
together (we live in different cities) and useful tricks and tips to live under the family (as the younger brother, I know a few strings to pull to even discussions).
It also aims to tell my story in his city as he discovers it.

In long term I wnat it to transition into a gamified-adulting app which provides the required knowledge to live in the modern world, focusing on those issues that
the traditional schools do not provide (unfortunately):
- Goverment-related tasks.
- Take benefit of your city offers and sourrounding.
- Do not fall for the same issues that have already happened in the history.
- Family-related nice-to-know and lessons learnt.
- ...

Then it transformed into a location-based media-storage with a few differences from other apps and keeping it very clear that **this is not another social network**. 
Instead, it wants to be more similar to a very private family photo album and journal shared between family members. 
- You have to physically be in a place to post something (or proof it via google-maps). The map of the world is not fully visible, you have to discover it "age-of-empire-style".
- Your family has full access and may have provided "tips" and "memories" from their past so that when you "discover" something, you know if your parents where ever there before.
- ...

Then it also opened the posibility to be an app to assit migrants when they first arrive to a city in a new country. Gamifiying the FamQuest to complete the required tasks to be part of the 
society, providing external tools, trick and tips etc. 

Why? I really want Jaime to get to the best starting-point when his adult live begins so that he can fight other battles and help beyond what most of us can do (because we need to do everything from scratch).
- Everyone struggles with the same paperwork and issues when we get (and lose) the first job.
- Society is not designed to simplify your life. 
- Families do not know each other anymore but we all walk the same streets (at least during many years).
- Social media and tech industry is creating young adults who have not visited their own cities and sorroundings because they are always on their phones in a coach. This app enforces to leave and have experiences that you can track.
- ...

Which are the red lines here?
- This is not a social network app that wants to know you better to sell your info and flood you with adds. 
- It is not going to be publicly available for "all your friends". This is a close-family (family means many things) app. Each family will host their own deployment with no external access from other users.
- ...

## Planning

All planning is centralized in the form of github milestones and associated-issues.
Any additional info is in the Wiki.

## Contribution

A Gitflow methodology is implemented within this repo. Proceed as follows:

1. Open an Issue, label appropriately and assign to the next planned release.
2. Pull the latest develop and branch off of it with a branch or PR created from Github.
4. After the first commit, open a DRAFT PR to develop.
3. Commit and push frequently.
4. When ready, set PR as ready, request review and wait for approval.

## License

Personal Public License to ensure that the project grows and receives contributions.

```text
                    GNU GENERAL PUBLIC LICENSE
                       Version 3, 29 June 2007

 Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 Everyone is permitted to copy and distribute verbatim copies
 of this license document, but changing it is not allowed.

```