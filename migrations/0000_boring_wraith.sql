CREATE TABLE `inspection_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`inspection_id` integer NOT NULL,
	`part_name` text NOT NULL,
	`defect_type` text NOT NULL,
	`severity` text NOT NULL,
	`notes` text,
	`position_x` integer,
	`position_y` integer,
	`vehicle_area` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `inspection_photos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`item_id` integer NOT NULL,
	`image_url` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `inspections` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`client_name` text NOT NULL,
	`vehicle_info` text NOT NULL,
	`license_plate` text NOT NULL,
	`status` text DEFAULT 'in_progress' NOT NULL,
	`created_at` integer
);
