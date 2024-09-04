# Welcome to the Workspace Frontend Repository!

This repository comprises the frontend aspect of the Workspace project, constructed using React.

## Setup Instructions

### Note

Before proceeding, please ensure Yarn is installed on your system.

You can install Yarn using the following command:

```bash
npm i --global yarn
```

##### In windows you can get this error while running yarn

```
yarn : File C:\Users\User\AppData\Roaming\npm\yarn.ps1 cannot be loaded because running scripts is disabled on this system. For more information, see about_Execution_Policies at
https:/go.microsoft.com/fwlink/?LinkID=135170.
At line:1 char:1

+ yarn --version
    + CategoryInfo          : SecurityError: (:) [], PSSecurityException
    + FullyQualifiedErrorId : UnauthorizedAccess
```

You can resolve it by executing the following command:

```ps1
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy Unrestricted
```

## Setting Up Locally

To set up the Workspace frontend locally, follow these steps:

#### 1.  Clone The Repo:

```bash
git clone https://github.com/CodeQuotient/workspacefrontend.git
```

OR

```bash
gh repo clone CodeQuotient/workspacefrontend
```

#### 2. Install Dependencies:

```bash
cd workspacefrontend && yarn
```

#### 3. Config Environment Variable

   1. In the root directory create ```.env``` file.
   2. Please Check ```.env.example``` for the required fields.
   3. For local development ```.env.example``` data can be used directly, copy ```.env.example``` data into ```.env``` file.

#### 4. Start the Development Server

   `yarn start`

## Contribution Guidlines

If you'd like to contribute to this project, feel free to submit pull requests or open issues. Please follow the exisiting code styles and ensure your changes are well-tested.

<br>
<br>

[![CC BY-NC-SA 4.0][cc-by-nc-sa-shield]][cc-by-nc-sa]

This work is licensed under a
[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License][cc-by-nc-sa].

[![CC BY-NC-SA 4.0][cc-by-nc-sa-image]][cc-by-nc-sa]

[cc-by-nc-sa]: http://creativecommons.org/licenses/by-nc-sa/4.0/
[cc-by-nc-sa-image]: https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png
[cc-by-nc-sa-shield]: https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg
