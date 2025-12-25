BACKGROUND PHOTO FOLDER

To use your own photos in the Christmas tree:

1.  Create a folder named `public` in the root of your project if it doesn't exist (e.g. if using Vite).
2.  Move this `photos` folder INSIDE the `public` folder.
    (Final path should be `your-project/public/photos/`)
3.  Place your images in that folder and name them 1.jpg, 2.jpg, ... 12.jpg.
4.  Open `constants.ts` and switch the configuration:
    - Comment out the `BACKGROUND_IMAGES` list with the online URLs.
    - Uncomment the `BACKGROUND_IMAGES` line that uses `/photos/${i + 1}.jpg`.

5.  Restart the application if necessary.

Note: Supported formats are jpg/png. Ensure filenames match exactly.