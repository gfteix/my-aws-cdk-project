import { z } from "zod";

export const MovieSchema = z.object({
    id: z.string().min(1).optional(),
    title: z.string().min(1),
    releaseDate: z.string(),
    watchedDate: z.string(),
    description: z.string(),
    myRating: z.number().optional(),
    imdbRating: z.number().optional(),
    notes: z.string().optional(),
});

export const PartialMovieSchema = z.object({
    id: z.string().min(1),
    title: z.string().min(1).optional(),
    releaseDate: z.string().optional(),
    watchedDate: z.string().optional(),
    description: z.string().optional(),
    myRating: z.number().optional(),
    imdbRating: z.number().optional(),
    notes: z.string().optional(),
});

export type Movie = z.infer<typeof MovieSchema>;
