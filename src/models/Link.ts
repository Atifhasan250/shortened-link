import mongoose, { Schema, Document } from 'mongoose';

export interface ILink extends Document {
  slug: string;
  url: string;
  editToken?: string;
  createdAt: Date;
  clickCount: number;
}

const LinkSchema = new Schema<ILink>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /^[a-zA-Z0-9_-]+$/,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    editToken: {
      type: String,
      required: false,
    },
    clickCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// Index for fast URL lookup (to check duplicates)
LinkSchema.index({ url: 1 });

export default mongoose.models.Link || mongoose.model<ILink>('Link', LinkSchema);
