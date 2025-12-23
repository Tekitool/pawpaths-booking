export const DOG_BREEDS = [
    { value: 'Mixed Breed', label: 'Mixed Breed' },
    { value: 'Labrador Retriever', label: 'Labrador Retriever' },
    { value: 'German Shepherd', label: 'German Shepherd' },
    { value: 'Golden Retriever', label: 'Golden Retriever' },
    { value: 'French Bulldog', label: 'French Bulldog' },
    { value: 'Bulldog', label: 'Bulldog' },
    { value: 'Poodle', label: 'Poodle' },
    { value: 'Beagle', label: 'Beagle' },
    { value: 'Rottweiler', label: 'Rottweiler' },
    { value: 'German Shorthaired Pointer', label: 'German Shorthaired Pointer' },
    { value: 'Dachshund', label: 'Dachshund' },
    { value: 'Pembroke Welsh Corgi', label: 'Pembroke Welsh Corgi' },
    { value: 'Australian Shepherd', label: 'Australian Shepherd' },
    { value: 'Yorkshire Terrier', label: 'Yorkshire Terrier' },
    { value: 'Boxer', label: 'Boxer' },
    { value: 'Great Dane', label: 'Great Dane' },
    { value: 'Siberian Husky', label: 'Siberian Husky' },
    { value: 'Cavalier King Charles Spaniel', label: 'Cavalier King Charles Spaniel' },
    { value: 'Doberman Pinscher', label: 'Doberman Pinscher' },
    { value: 'Miniature Schnauzer', label: 'Miniature Schnauzer' },
    { value: 'Shih Tzu', label: 'Shih Tzu' },
    { value: 'Boston Terrier', label: 'Boston Terrier' },
    { value: 'Bernese Mountain Dog', label: 'Bernese Mountain Dog' },
    { value: 'Pomeranian', label: 'Pomeranian' },
    { value: 'Havanese', label: 'Havanese' },
    { value: 'Cane Corso', label: 'Cane Corso' },
    { value: 'English Springer Spaniel', label: 'English Springer Spaniel' },
    { value: 'Shetland Sheepdog', label: 'Shetland Sheepdog' },
    { value: 'Brittany', label: 'Brittany' },
    { value: 'Pug', label: 'Pug' },
    { value: 'Cocker Spaniel', label: 'Cocker Spaniel' },
    { value: 'Border Collie', label: 'Border Collie' },
    { value: 'Mastiff', label: 'Mastiff' },
    { value: 'Chihuahua', label: 'Chihuahua' },
    { value: 'Vizsla', label: 'Vizsla' },
    { value: 'Basset Hound', label: 'Basset Hound' },
    { value: 'Belgian Malinois', label: 'Belgian Malinois' },
    { value: 'Maltese', label: 'Maltese' },
    { value: 'Weimaraner', label: 'Weimaraner' },
    { value: 'Collie', label: 'Collie' },
    { value: 'Newfoundland', label: 'Newfoundland' },
    { value: 'Rhodesian Ridgeback', label: 'Rhodesian Ridgeback' },
    { value: 'Shiba Inu', label: 'Shiba Inu' },
    { value: 'West Highland White Terrier', label: 'West Highland White Terrier' },
    { value: 'Bichon Frise', label: 'Bichon Frise' },
    { value: 'Bloodhound', label: 'Bloodhound' },
    { value: 'Akita', label: 'Akita' },
    { value: 'St. Bernard', label: 'St. Bernard' },
    { value: 'Other', label: 'Other' }
].sort((a, b) => {
    if (a.label === 'Other') return 1;
    if (b.label === 'Other') return -1;
    return a.label.localeCompare(b.label);
});

export const CAT_BREEDS = [
    { value: 'Mixed Breed', label: 'Mixed Breed' },
    { value: 'Domestic Short Hair', label: 'Domestic Short Hair' },
    { value: 'Domestic Medium Hair', label: 'Domestic Medium Hair' },
    { value: 'Domestic Long Hair', label: 'Domestic Long Hair' },
    { value: 'Persian', label: 'Persian' },
    { value: 'Maine Coon', label: 'Maine Coon' },
    { value: 'Ragdoll', label: 'Ragdoll' },
    { value: 'Siamese', label: 'Siamese' },
    { value: 'Bengal', label: 'Bengal' },
    { value: 'Sphynx', label: 'Sphynx' },
    { value: 'British Shorthair', label: 'British Shorthair' },
    { value: 'Abyssinian', label: 'Abyssinian' },
    { value: 'Scottish Fold', label: 'Scottish Fold' },
    { value: 'Birman', label: 'Birman' },
    { value: 'Himalayan', label: 'Himalayan' },
    { value: 'American Shorthair', label: 'American Shorthair' },
    { value: 'Devon Rex', label: 'Devon Rex' },
    { value: 'Russian Blue', label: 'Russian Blue' },
    { value: 'Norwegian Forest Cat', label: 'Norwegian Forest Cat' },
    { value: 'Exotic Shorthair', label: 'Exotic Shorthair' },
    { value: 'Burmese', label: 'Burmese' },
    { value: 'Siberian', label: 'Siberian' },
    { value: 'Tonkinese', label: 'Tonkinese' },
    { value: 'Other', label: 'Other' }
].sort((a, b) => {
    if (a.label === 'Other') return 1;
    if (b.label === 'Other') return -1;
    return a.label.localeCompare(b.label);
});

export const dogBreeds = DOG_BREEDS;
export const catBreeds = CAT_BREEDS;

export const BIRD_BREEDS = [
    { value: 'Parrot', label: 'Parrot' },
    { value: 'Canary', label: 'Canary' },
    { value: 'Falcon', label: 'Falcon' },
    { value: 'Finches', label: 'Finches' },
    { value: 'Parakeet', label: 'Parakeet' },
    { value: 'Other', label: 'Other' }
].sort((a, b) => {
    if (a.label === 'Other') return 1;
    if (b.label === 'Other') return -1;
    return a.label.localeCompare(b.label);
});

export const OTHER_PET_BREEDS = [
    { value: 'Rabbit', label: 'Rabbit' },
    { value: 'Ferret', label: 'Ferret' },
    { value: 'Hamster', label: 'Hamster' },
    { value: 'Lizard', label: 'Lizard' },
    { value: 'Fishes', label: 'Fishes' },
    { value: 'Turtles', label: 'Turtles' },
    { value: 'Other', label: 'Other' }
].sort((a, b) => {
    if (a.label === 'Other') return 1;
    if (b.label === 'Other') return -1;
    return a.label.localeCompare(b.label);
});
