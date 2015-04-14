select 	latitude, longitude, id
from 		bagsintrees.photos
where  latitude is not null and ($filter$) and ($range$);