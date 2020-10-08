// Here we define our query as a multi-line string
// Storing it in a separate .graphql/.gql file is also possible
var queryMain = `
query ($id: Int, $page: Int, $perPage: Int, $search: String, $season: MediaSeason, $seasonYear: Int, $format: MediaFormat) { # Define which variables will be used in the query (id)
    Page (page: $page, perPage: $perPage) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
          perPage
        }
      media (id: $id, type: ANIME, search: $search, season: $season, seasonYear: $seasonYear, format: $format) { # Insert our variables into the query arguments (id) (type: ANIME is hard-coded in the query)
            id
            idMal
            title {
                romaji
                english
                native
            }
            bannerImage
            coverImage {
                extraLarge
                large
                medium
            }
            relations {
                nodes {
                    id
                    title {
                        romaji
                        english
                        native
                    }
                    status
                    description(asHtml: false)
                    episodes
                    season
                    startDate {
                        year
                        month
                        day
                    }
                    endDate {
                        year 
                        month 
                        day
                    }
                    coverImage{
                        large
                    }
                }
                edges {
                    id
                    relationType
                    node {
                        id
                        title {
                            english
                            romaji
                            native
                        }
                        type
                        description
                        season
                        startDate {
                            year
                            month
                            day
                        }
                        endDate {
                            year
                            month
                            day
                        }
                    }
                }
            }
            genres
            type
            status
            description(asHtml: false)
            episodes
            duration
            averageScore
            meanScore
            popularity
            isAdult
            siteUrl
            format
            hashtag
            synonyms
            source
            season
            studios {
                nodes {
                    id
                    name
                    isAnimationStudio
                    siteUrl
                } 
            }
            externalLinks {
                id
                url
                site
            }
            streamingEpisodes {
                title
                thumbnail
                url
                site
            }
            startDate {
                year
                month
                day
            }
            endDate {
                year
                month 
                day
            }
            tags {
                id
                name
                description
                category
                rank
                isGeneralSpoiler
                isMediaSpoiler
                isAdult
            }
            nextAiringEpisode {
                id
                airingAt
                timeUntilAiring
                episode
                media {
                    title{
                        romaji
                        english
                        native
                    }
                    startDate {
                        year
                        month
                        day
                    }
                }
            }
            trailer {
                id
                site
                thumbnail
            }
        }
    }
}
`;

var queryTimes = `
query ($id: Int, $page: Int, $perPage: Int, $search: String, $season: MediaSeason, $seasonYear: Int, $format: MediaFormat) { # Define which variables will be used in the query (id)
    Page (page: $page, perPage: $perPage) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
          perPage
        }
      media (id: $id, type: ANIME, search: $search, season: $season, seasonYear: $seasonYear, format: $format) { # Insert our variables into the query arguments (id) (type: ANIME is hard-coded in the query)
            id
            title {
                romaji
                english
                native
            }
            
            type
            status
            episodes
            averageScore
            meanScore
            popularity
            season
            startDate {
                year
                month
                day
            }
            endDate {
                year
                month 
                day
            }
            nextAiringEpisode {
                id
                airingAt
                timeUntilAiring
                episode
                media {
                    title{
                        romaji
                        english
                        native
                    }
                    startDate {
                        year
                        month
                        day
                    }
                }
            }
        }
    }
}
`;
module.exports = { queryMain, queryTimes }