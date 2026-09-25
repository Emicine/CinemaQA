-- Red Cinema seed data
-- 24 movies used as the project's initial catalogue.
-- The INSERT is idempotent: restarting the API will not create duplicates.
-- It is safe to run this script more than once.

INSERT INTO movie (movie_name, movie_genre, movie_director, movie_release_date, movie_description, movie_duration, movie_poster_url, total_bookings)
SELECT 'Jurassic Park', 'SCIENCE_FICTION', 'Steven Spielberg', DATE '1993-06-11', 'A group of scientists and visitors arrive at a remote island where dinosaurs have been brought back to life through genetic engineering. When the park''s security systems fail, the prehistoric creatures escape and turn the island into a fight for survival.', 127, 'https://cdng.europosters.eu/pod_public/750/266264.jpg', 0 WHERE NOT EXISTS (SELECT 1 FROM movie WHERE movie_name = 'Jurassic Park');

INSERT INTO movie (movie_name, movie_genre, movie_director, movie_release_date, movie_description, movie_duration, movie_poster_url, total_bookings)
SELECT 'Back to the Future', 'SCIENCE_FICTION', 'Robert Zemeckis', DATE '1985-07-03', 'Teenager Marty McFly accidentally travels back to 1955 in a time machine built by the eccentric Doc Brown. He must repair the past and find a way back to the future without changing his own destiny.', 116, 'https://m.media-amazon.com/images/I/71EzpRa+CNL.jpg', 0 WHERE NOT EXISTS (SELECT 1 FROM movie WHERE movie_name = 'Back to the Future');

INSERT INTO movie (movie_name, movie_genre, movie_director, movie_release_date, movie_description, movie_duration, movie_poster_url, total_bookings)
SELECT 'Forrest Gump', 'DRAMA', 'Robert Zemeckis', DATE '1994-07-06', 'Forrest Gump is an extraordinary man whose simple outlook on life takes him through some of the most important moments of American history. Along the way, he experiences friendship, love, loss and unexpected success.', 142, 'https://m.media-amazon.com/images/I/71CuAt3ey+L.jpg', 0 WHERE NOT EXISTS (SELECT 1 FROM movie WHERE movie_name = 'Forrest Gump');

INSERT INTO movie (movie_name, movie_genre, movie_director, movie_release_date, movie_description, movie_duration, movie_poster_url, total_bookings)
SELECT 'Gremlins', 'HORROR', 'Joe Dante', DATE '1984-06-08', '  Billy receives a mysterious creature named Gizmo as a Christmas present, along with strict rules for taking care of him. When the rules are accidentally broken, mischievous creatures multiply and turn the town upside down.', 106, 'https://m.media-amazon.com/images/I/51PViZhkSVL.jpg', 0 WHERE NOT EXISTS (SELECT 1 FROM movie WHERE movie_name = 'Gremlins');

INSERT INTO movie (movie_name, movie_genre, movie_director, movie_release_date, movie_description, movie_duration, movie_poster_url, total_bookings)
SELECT 'Edward Scissorhands', 'ROMANCE', 'Tim Burton', DATE '1990-12-07', 'Edward is an artificial man created by an inventor who dies before finishing him, leaving Edward with scissors instead of hands. After being taken into a suburban community, he falls in love while struggling to fit into a world that fears his differences.', 104, 'https://media.posterlounge.com/img/products/710000/706512/706512_poster.jpg', 0 WHERE NOT EXISTS (SELECT 1 FROM movie WHERE movie_name = 'Edward Scissorhands');

INSERT INTO movie (movie_name, movie_genre, movie_director, movie_release_date, movie_description, movie_duration, movie_poster_url, total_bookings)
SELECT 'Zootopia', 'COMEDY', 'Byron Howard, Rich Moore', DATE '2016-03-04', 'Judy Hopps becomes the first rabbit police officer in the city of Zootopia. When animals mysteriously begin disappearing, she teams up with a clever fox named Nick Wilde to solve a dangerous case.', 108, 'https://fr.web.img3.acsta.net/pictures/15/12/11/14/34/280851.jpg', 0 WHERE NOT EXISTS (SELECT 1 FROM movie WHERE movie_name = 'Zootopia');

INSERT INTO movie (movie_name, movie_genre, movie_director, movie_release_date, movie_description, movie_duration, movie_poster_url, total_bookings)
SELECT 'Coco', 'DRAMA', 'Lee Unkrich, Adrian Molina', DATE '2017-10-27', 'Miguel dreams of becoming a musician despite his family''s ban on music. During the Day of the Dead, he unexpectedly enters the Land of the Dead, where he discovers secrets about his family and his musical heritage.', 106, 'https://i.pinimg.com/736x/52/40/93/52409341203bb9276ec911ebbda4f91d.jpg', 0 WHERE NOT EXISTS (SELECT 1 FROM movie WHERE movie_name = 'Coco');

INSERT INTO movie (movie_name, movie_genre, movie_director, movie_release_date, movie_description, movie_duration, movie_poster_url, total_bookings)
SELECT 'The Iron Giant', 'SCIENCE_FICTION', 'Brad Bird', DATE '1999-08-06', 'A young boy discovers a gigantic robot who has fallen from outer space. As they become friends, the boy tries to protect the mysterious Giant from the military and help him understand what it means to be human.', 86, 'https://s3.amazonaws.com/nightjarprod/content/uploads/sites/130/2024/04/17003017/iron-giant-1999-poster-scaled.jpg', 0 WHERE NOT EXISTS (SELECT 1 FROM movie WHERE movie_name = 'The Iron Giant');

INSERT INTO movie (movie_name, movie_genre, movie_director, movie_release_date, movie_description, movie_duration, movie_poster_url, total_bookings)
SELECT 'Kindergarten Cop', 'ACTION', 'Ivan Reitman', DATE '1990-12-21', 'A tough police detective goes undercover as a kindergarten teacher to find the ex-wife and son of a dangerous criminal. His mission becomes much harder when he discovers that controlling a classroom of children is its own kind of challenge.', 111, 'https://i.ebayimg.com/images/g/gGUAAOSw~jtkdsKk/s-l1200.jpg', 0 WHERE NOT EXISTS (SELECT 1 FROM movie WHERE movie_name = 'Kindergarten Cop');

INSERT INTO movie (movie_name, movie_genre, movie_director, movie_release_date, movie_description, movie_duration, movie_poster_url, total_bookings)
SELECT 'The Wild Robot', 'SCIENCE_FICTION', 'Chris Sanders', DATE '2024-09-27', 'After a shipwreck, Roz, an intelligent robot, becomes stranded on a remote island. As she learns to survive among wild animals, she forms an unexpected bond with an orphaned gosling and discovers the meaning of family.', 102, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXK6rpyUfKkkVhWsltOIx2WBKSApNm_RHi3VJkvp3CacUU68D0kX_NuVmX&s=10', 0 WHERE NOT EXISTS (SELECT 1 FROM movie WHERE movie_name = 'The Wild Robot');

INSERT INTO movie (movie_name, movie_genre, movie_director, movie_release_date, movie_description, movie_duration, movie_poster_url, total_bookings)
SELECT 'Beetlejuice', 'HORROR', 'Tim Burton', DATE '1988-03-30', 'After a recently deceased couple discover that their former home is occupied by a new family, they turn to the unpredictable ghost Beetlejuice for help. His chaotic methods quickly make their haunting much more complicated than expected.', 92, 'https://static.posters.cz/image/750/214939.jpg', 0 WHERE NOT EXISTS (SELECT 1 FROM movie WHERE movie_name = 'Beetlejuice');

INSERT INTO movie (movie_name, movie_genre, movie_director, movie_release_date, movie_description, movie_duration, movie_poster_url, total_bookings)
SELECT 'A Little Princess', 'DRAMA', 'Alfonso Cuarón', DATE '1995-05-19', 'Sara is sent to a strict boarding school while her father serves overseas during World War I. When she receives devastating news, she is forced into a life of hardship but refuses to let go of her imagination and kindness.', 97, 'https://cdn11.bigcommerce.com/s-ydriczk/images/stencil/1280w/products/82557/92404/A-LITTLE-PRINCESS-1995-ORIGINAL-CINEMA-POSTER__24244.1549371010.jpg?c=2', 0 WHERE NOT EXISTS (SELECT 1 FROM movie WHERE movie_name = 'A Little Princess');

INSERT INTO movie (movie_name, movie_genre, movie_director, movie_release_date, movie_description, movie_duration, movie_poster_url, total_bookings)
SELECT 'Cool Runnings', 'COMEDY', 'Jon Turteltaub', DATE '1993-10-01', 'After failing to qualify for the Summer Olympics, a group of Jamaican athletes decides to form the country''s first bobsled team. With little experience and no snow at home, they train against the odds to reach the Winter Olympics.', 98, 'https://i.ebayimg.com/00/s/MTQyNlgxMDAw/z/UnEAAOSwGMtknpoX/$_57.JPG?set_id=8800005007', 0 WHERE NOT EXISTS (SELECT 1 FROM movie WHERE movie_name = 'Cool Runnings');

INSERT INTO movie (movie_name, movie_genre, movie_director, movie_release_date, movie_description, movie_duration, movie_poster_url, total_bookings)
SELECT 'Jumanji', 'SUSPENSE', 'Joe Johnston', DATE '1995-12-15', 'Two children discover a mysterious board game that unleashes dangerous forces from a jungle world. When they begin playing, they must finish the game and face its increasingly unpredictable challenges before the chaos destroys their town.', 104, 'https://www.cinematerial.com/p/500x/pgnnumy8/jumanji-movie-poster.jpg?v=1456279086', 0 WHERE NOT EXISTS (SELECT 1 FROM movie WHERE movie_name = 'Jumanji');

INSERT INTO movie (movie_name, movie_genre, movie_director, movie_release_date, movie_description, movie_duration, movie_poster_url, total_bookings)
SELECT 'Who Framed Roger Rabbit', 'COMEDY', 'Robert Zemeckis', DATE '1988-06-22', 'Private detective Eddie Valiant is hired to investigate a murder involving cartoon star Roger Rabbit. As Eddie searches for the truth, he uncovers a dangerous conspiracy threatening both the human world and Toontown.', 104, 'https://w0.peakpx.com/wallpaper/774/33/HD-wallpaper-who-framed-roger-1988-movie-poster-roger-rabbit-who-framed.jpg', 0 WHERE NOT EXISTS (SELECT 1 FROM movie WHERE movie_name = 'Who Framed Roger Rabbit');

INSERT INTO movie (movie_name, movie_genre, movie_director, movie_release_date, movie_description, movie_duration, movie_poster_url, total_bookings)
SELECT 'A Bug''s Life', 'COMEDY', 'John Lasseter, Andrew Stanton', DATE '1998-11-25', 'Flik, an inventive but clumsy ant, accidentally recruits a group of circus insects to defend his colony from a gang of bullying grasshoppers. Together, the unlikely heroes discover that courage and teamwork can overcome even the biggest threat.', 95, 'https://image.tmdb.org/t/p/original/hprXO1PBGuriU14TYn0yD2e8LOv.jpg', 0 WHERE NOT EXISTS (SELECT 1 FROM movie WHERE movie_name = 'A Bug''s Life');

INSERT INTO movie (movie_name, movie_genre, movie_director, movie_release_date, movie_description, movie_duration, movie_poster_url, total_bookings)
SELECT 'Space Jam', 'COMEDY', 'Joe Pytka', DATE '1996-11-15', 'Basketball superstar Michael Jordan is pulled into the world of the Looney Tunes. He must help Bugs Bunny and his friends defeat a group of alien opponents in an extraordinary basketball game.', 87, 'https://summerofthearts.org/wp-content/uploads/Space-Jam.jpg', 0 WHERE NOT EXISTS (SELECT 1 FROM movie WHERE movie_name = 'Space Jam');

INSERT INTO movie (movie_name, movie_genre, movie_director, movie_release_date, movie_description, movie_duration, movie_poster_url, total_bookings)
SELECT 'Die Hard', 'ACTION', 'John McTiernan', DATE '1988-07-15', 'New York police officer John McClane visits Los Angeles for Christmas, but his plans change when terrorists take control of his wife''s office building. Trapped inside, he must fight alone to rescue the hostages.', 132, 'https://m.media-amazon.com/images/I/61u56-ZcTbL.jpg', 0 WHERE NOT EXISTS (SELECT 1 FROM movie WHERE movie_name = 'Die Hard');

INSERT INTO movie (movie_name, movie_genre, movie_director, movie_release_date, movie_description, movie_duration, movie_poster_url, total_bookings)
SELECT 'The Terminator', 'SCIENCE_FICTION', 'James Cameron', DATE '1984-10-26', 'A deadly cyborg travels back in time to assassinate Sarah Connor before the birth of her future son, who will lead humanity''s resistance against machines. A soldier from the future is sent back to protect her.', 107, 'https://m.media-amazon.com/images/I/61yzzySjniL.AC_UF1000,1000_QL80.jpg', 0 WHERE NOT EXISTS (SELECT 1 FROM movie WHERE movie_name = 'The Terminator');

INSERT INTO movie (movie_name, movie_genre, movie_director, movie_release_date, movie_description, movie_duration, movie_poster_url, total_bookings)
SELECT 'Beverly Hills Cop', 'ACTION', 'Martin Brest', DATE '1984-12-05', 'Detroit detective Axel Foley travels to Beverly Hills after his best friend is murdered. His unconventional methods clash with the local police as he investigates a powerful criminal operation.', 105, 'https://revuecinema.ca/wp-content/uploads/2024/06/beverly_hills_cop_tmdb-ebjevkkhq0tut1dbacteyw6kcle.jpg', 0 WHERE NOT EXISTS (SELECT 1 FROM movie WHERE movie_name = 'Beverly Hills Cop');

INSERT INTO movie (movie_name, movie_genre, movie_director, movie_release_date, movie_description, movie_duration, movie_poster_url, total_bookings)
SELECT 'The Karate Kid', 'DRAMA', 'John G. Avildsen', DATE '1984-06-22', 'Daniel LaRusso moves to California and struggles to adapt to his new life while being bullied by a group of karate students. With the help of Mr. Miyagi, he learns karate, discipline and confidence.', 126, 'https://cdng.europosters.eu/pod_public/1300/262795.jpg', 0 WHERE NOT EXISTS (SELECT 1 FROM movie WHERE movie_name = 'The Karate Kid');

INSERT INTO movie (movie_name, movie_genre, movie_director, movie_release_date, movie_description, movie_duration, movie_poster_url, total_bookings)
SELECT 'The Greatest Showman', 'DRAMA', 'Michael Gracey', DATE '2017-12-20', 'P.T. Barnum dreams of creating a spectacular show unlike anything the world has seen. As his performers become a sensation, he must balance his ambition, his family and the people who helped make his dream possible.', 105, 'https://m.media-amazon.com/images/I/91k5iUBRGUL.jpg', 0 WHERE NOT EXISTS (SELECT 1 FROM movie WHERE movie_name = 'The Greatest Showman');

INSERT INTO movie (movie_name, movie_genre, movie_director, movie_release_date, movie_description, movie_duration, movie_poster_url, total_bookings)
SELECT 'Christopher Robin', 'DRAMA', 'Marc Forster', DATE '2018-08-03', 'Christopher Robin has grown up and become consumed by work, leaving his childhood memories behind. When Winnie the Pooh and his old friends return to his life, they help him rediscover imagination, friendship and the importance of his family.', 104, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSoZzKvHP_InpYhQqQ3U76g6sJOpwHgmaXfBFWlDdKjQYgI8mYsnaKapBQ&s=10', 0 WHERE NOT EXISTS (SELECT 1 FROM movie WHERE movie_name = 'Christopher Robin');

INSERT INTO movie (movie_name, movie_genre, movie_director, movie_release_date, movie_description, movie_duration, movie_poster_url, total_bookings)
SELECT 'Encanto', 'DRAMA', 'Jared Bush, Byron Howard, Charise Castro Smith', DATE '2021-11-24', 'Mirabel is the only member of the magical Madrigal family without a special gift. When the magic protecting her family begins to disappear, she sets out to discover what is threatening their home and bring her family back together.', 102, 'https://lumiere-a.akamaihd.net/v1/images/image_85dfaa4f.jpeg?region=0,0,540,810', 0 WHERE NOT EXISTS (SELECT 1 FROM movie WHERE movie_name = 'Encanto');
