# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

1- Le typage de mes donnée il y'a parfaois quelque decalage entre le format de donnée de index.ts et les model du backend

2- j'ai eu beaucoup bug a cause de la non correspondans des type de retour du backend et du frontend (c'est à dire le backend envoyait
res.status(200).json(Ex: nature) <- un tableau []>
mais le frontend attendais
res.status(200).json({Ex: nature}) <- un objet contenant un tableau {[]}> )

3- J'ai passé deux jour à chercher une erreur inexistante, j'avais crée des pièces, constituer un dossier avec ces pièces là et crée une liquidation avec ce dossier(pièces -> dossier -> liquidation). Par la suite j'ai supprimer ces pièces vu que les noms était un peu naze (Ex: test, aa, AB7, etc . . .) mais j'avais oublier que je l'ai utilisait dans d'autre table, donc que l' essayais de récuperer le (Libelle) des pièces dans LiquidationDetails.tsx (Erreur 😒)

4- J'ai ajouter des as: a tout mes association dans mes models..

5- verifier chaque endpoint avant de l'esposer au frontend c'est important, chaque endpoint sans exception, pour eviter le probleme de la recuperation des element des dropdown de liquidationForm.tsx au niveau du Promise.All() et de liquidationPage.tsx

6- Cest le liquidationPage.tsx qui charge, et stock les element dans les dropdown des Form via les props de ces different Form.
